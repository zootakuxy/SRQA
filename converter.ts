import {etc, Source} from "./load";
import {Question, readQuestions} from "./qa";
import * as Path from "path";
import * as fs from "fs";
import {TTLOptions, TTSManager} from "./tts";
import {normalizeDiacritics} from "normalize-text";
import {id3Question} from "./id3";
import * as console from "console";

let regexp = /[^a-zA-Z0-9\s\-._&]/g;

let ttsManager = new TTSManager();

export const MAX_TIME_PAUSE = 18;
export const MIN_TIME_PAUSE = 8;
export const DIFF_TIME_PAUSE = MAX_TIME_PAUSE - MIN_TIME_PAUSE;

export type FileDirections = {
    audioFileOf( question:Question,  type:"Q&A"|"Question"|"Response"|"Important" ):string
    rawFileOf( question:Question,  type:"Q&A"|"Question"|"Response"|"Important" ):string
}
export function fileDirections( source:Source, audioFolder, rawFolder ):FileDirections{
    return {
        audioFileOf( question:Question,  type:"Q&A"|"Question"|"Response"|"Important" ){
            let fileName = `${type} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.mp3`;
            if( type === "Important"){
                fileName = `${ question.type } - ${type}_${question.important} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.mp3`;
            }
            fileName = normalizeDiacritics( fileName );
            fileName = fileName.replace( regexp, "" );
            let audioFile;

            let LabelType:{[p in typeof type]:string} = {
                "Q&A": "Q&A",
                Question: "Question",
                Response: "Answerer",
                Important: "Q&A"
            }

            if( type === "Important" ){
                audioFile = Path.join( audioFolder, type, `Important-${question.important}`, fileName );
            } else audioFile = Path.join( audioFolder, type, `${LabelType[type]} - ${ source.name }`, fileName );
            return audioFile;
        },
        rawFileOf ( question:Question,  type:"Q&A"|"Question"|"Response"|"Important" ){
            let fileName = `${type} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.raw`;
            fileName = fileName.replace( regexp, "" );
            let rawFile;
            let LabelType:{[p in typeof type]:string} = {
                "Q&A": "Q&A",
                Question: "Question",
                Response: "Answerer",
                Important: "Q&A"
            }
            rawFile = Path.join( rawFolder, type, `${LabelType[type]} - ${ source.name }`, fileName );
            return rawFile;
        }
    }
}

export type ConvertOptions = {
    convert?:boolean,
    convertQuestion?:boolean,
    convertAnswer?:boolean
}
export function converter( source:Source, audioFolder:string, rawFolder:string, opts:ConvertOptions ){


    let fdir = fileDirections( source, audioFolder, rawFolder );

    return new Promise( ( resolve ) => {

        if( fs.existsSync(Path.join( audioFolder, "Important" ) ) )
            fs.rmSync(Path.join( audioFolder, "Important" ), { recursive: true });

        readQuestions( source.filename, source.name ).then( readQuestions => {
            console.log({

            } )
            let questions = [ ...readQuestions.questions ];


            let ttlOptions:TTLOptions = {
                language: source.configs.translate.language,
                country: source.configs.translate.country,
                text:"",
                voice:"",
                audioFileName:"",
                voiceGender: "",
                voiceType:"",
                label:"",
                ssml:true
            }

            let _process = ()=>{
                let _current = questions.shift();
                if( !_current ) return resolve( source );
                let convert = _current.change
                    || !_current.converted
                    || ( !fs.existsSync( fdir.audioFileOf( _current, "Question" )) && opts.convertQuestion )
                    || ( !fs.existsSync( fdir.audioFileOf( _current, "Response" )) && opts.convertAnswer )
                    || ( !fs.existsSync( fdir.audioFileOf( _current, "Q&A" )) && opts.convert )
                ;

                let workName = `Convert question ${ _current.number } from ${ source.name } `;
                console.log( workName, "..." );
                if( !convert ){
                    console.log( workName, "... skip!" );
                    return next( _current );
                }

                let isPair = _current.number%2 === 0;
                let voice = isPair? source.configs.translate[2] : source.configs.translate[1];

                let Jobs:{[p in "Q&A"|"question"|"answer"]:()=>Promise<boolean>} = {
                    question: () => {
                        return new Promise( (jobResolve, reject) => {
                            let text = `<break time="1s"/>${_current.question}<break time="5s"/>`;
                            let audioFile = fdir.audioFileOf( _current, "Question" );
                            let rawFile = fdir.rawFileOf( _current, "Question" );


                            ttlOptions.voice = voice.voiceName;
                            ttlOptions.voiceType = voice.voiceType;
                            ttlOptions.voiceGender = voice.voiceGender;
                            ttlOptions.text  = text;
                            ttlOptions.audioFileName = audioFile;
                            ttlOptions.language = `${ workName } ... CREATED QUESTION`

                            ttsManager.convert( { ...ttlOptions }   ).then( rawQuestion => {
                                if( !rawQuestion ) return jobResolve( false );
                                fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                                fs.writeFileSync( rawFile, rawQuestion );
                                _current.convertedQuestion = true;
                                jobResolve( true );
                            });
                        })
                    }, answer: () => {
                        return new Promise( (jobResolve, reject) => {
                            let text = `<break time="1s"/>${_current.answer }<break time="5s"/>`;
                            let audioFile = fdir.audioFileOf( _current, "Response" );
                            let rawFile = fdir.rawFileOf( _current, "Response" );


                            ttlOptions.voice = voice.voiceName;
                            ttlOptions.voiceType = voice.voiceType;
                            ttlOptions.voiceGender = voice.voiceGender;
                            ttlOptions.text  = text;
                            ttlOptions.audioFileName = audioFile;
                            ttlOptions.language = `${ workName } ... CREATED ANSWER`;

                            ttsManager.convert( ttlOptions ).then( rawAnswer => {
                                if( !rawAnswer ) return jobResolve( false );
                                fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                                fs.writeFileSync( rawFile, rawAnswer );
                                _current.convertedAnswer = true;
                                jobResolve(true )
                            })
                        });
                    }, "Q&A"(){
                        return new Promise( jobResolve => {

                            let percent = (_current.questionLength * 1.0 )/readQuestions.maxLength;
                            let time = (DIFF_TIME_PAUSE*percent)+MIN_TIME_PAUSE;
                            let seconds = Math.round(time);

                            let text = `<break time="2s"/>${_current.question}<break time="${seconds}s"/>\n${_current.answer}<break time="4s"/>`;
                            let audioFile = fdir.audioFileOf( _current, "Q&A" );
                            let rawFile = fdir.rawFileOf( _current, "Q&A" );

                            ttlOptions.voice = voice.voiceName;
                            ttlOptions.voiceType = voice.voiceType;
                            ttlOptions.voiceGender = voice.voiceGender;
                            ttlOptions.text  = text;
                            ttlOptions.audioFileName = audioFile;
                            ttlOptions.language = `${ workName } ... CREATED Q&A`;

                            console.log( "use time pause", seconds )

                            ttsManager.convert( ttlOptions ).then( rawQA => {
                                if( !rawQA ) return jobResolve( false );
                                fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                                fs.writeFileSync( rawFile, rawQA );
                                _current.converted = true;
                                jobResolve(  true );
                            })
                        })
                    }
                }

                let useJobs:(()=>Promise<boolean>)[] = [];
                if( opts.convertQuestion ) useJobs.push( Jobs["question"]);
                if( opts.convertAnswer ) useJobs.push( Jobs["answer"]);
                if( opts.convert ) useJobs.push( Jobs["Q&A"]  );

                let _jobGo = ()=>{
                    let _nextJob = useJobs.shift();
                    if( typeof _nextJob !== "function" ){
                        console.log( workName, "...ok!" );
                        return next( _current );
                    }
                    _nextJob().then( result => {
                        if( !result ) return resolve( false );
                        readQuestions.save();
                        _jobGo();
                    });
                };
                _jobGo();

                // text = `<break time="1s"/>${_current.question}<break time="15s"/>`;
                // audioFile = fdir.audioFileOf( _current, "Question" );
                // rawFile = fdir.rawFileOf( _current, "Question" );
                // ttsManager.convert( source.configs.translate.language, voice, _current.question, audioFile,  `${ workName } ... CREATED QUESTION` ).then( rawQuestion => {
                //     if( !rawQuestion ) return resolve( false );
                //
                //     fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                //     fs.writeFileSync( rawFile, rawQuestion );
                //
                //     audioFile = fdir.audioFileOf( _current, "Response" );
                //     rawFile = fdir.rawFileOf( _current, "Response" );
                //     ttsManager.convert( source.configs.translate.language, voice, _current.answer, audioFile, `${workName} ... CREATED ANSWER` ).then( rawAnswer => {
                //         if( !rawAnswer ) return resolve( false );
                //         fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                //         fs.writeFileSync( rawFile, rawAnswer );

                        // text = `<break time="1s"/>${_current.question}<break time="10s"/>\n${_current.answer}<break time="5s"/>`;
                        //
                        // audioFile = fdir.audioFileOf( _current, "Q&A" );
                        // rawFile = fdir.rawFileOf( _current, "Q&A" );
                        // ttsManager.convert( source.configs.translate.language, voice, text, audioFile, `${workName} ... CREATED Q&A` ).then( rawQA => {
                        //     if( !rawQA ) return resolve( false );
                        //     fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                        //     fs.writeFileSync( rawFile, rawQA );
                        //     _current.converted = true;
                        //     readQuestions.save();
                        //
                        //
                        //     next( _current );
                        // })
                    // })
                // });
            };

            let next = ( _preview:Question )=>{
                if( !!_preview && _preview.important ){
                    let audioFile = fdir.audioFileOf( _preview, "Q&A" );
                    let important = fdir.audioFileOf( _preview, "Important" );
                    fs.mkdirSync( Path.dirname(important), { recursive: true } );
                    fs.copyFileSync( audioFile, important );
                }

                if( !!_preview ) id3Question( fdir, _preview ).then( () => _process() )
                else _process();
            }

            next( null );
        });
    });
}
