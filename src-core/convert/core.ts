import {etc, Source} from "../load";
import {Question, readQuestions} from "../qa";
import * as Path from "path";
import * as fs from "fs";
import {TTLOptions, TTSManager} from "../lib/tts";
import {normalizeDiacritics} from "normalize-text";
import {id3Question} from "../util/id3";
import * as console from "console";
import {breakTimeAudios, timePause} from "./break-time";
import {audioJoin, fixJoinedAudio} from "../util/file-join";

let regexp = /[^a-zA-Z0-9\s\-._&]/g;

let ttsManager = new TTSManager();

export const MAX_TIME_PAUSE = 25;
export const MIN_TIME_PAUSE = 8;
export const END_TIME_PAUSE  = 5;
export const DIFF_TIME_PAUSE = MAX_TIME_PAUSE - MIN_TIME_PAUSE;

export type AudioType = "Q+A"|"Question"|"Answer"|"Important";

export type FileDirections = {
    audioFileOf( question:Question,  type:AudioType ):string
    rawFileOf( question:Question,  type:AudioType ):string
}
export function fileDirections( source:Source, audioFolder, rawFolder ):FileDirections{
    return {
        audioFileOf( question:Question,  type:AudioType ){
            let fileName = `${type} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.mp3`;
            if( type === "Important"){
                fileName = `${ question.type } - ${type}_${question.important} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.mp3`;
            }
            fileName = normalizeDiacritics( fileName );
            fileName = fileName.replace( regexp, "" );
            let audioFile;

            let LabelType:{[p in typeof type]:string} = {
                "Q+A": "Q&A",
                Question: "Question",
                Answer: "Answer",
                Important: "Q&A"
            }

            if( type === "Important" ){
                audioFile = Path.join( audioFolder, type, `Important-${question.important}`, fileName );
            } else audioFile = Path.join( audioFolder, type, `${LabelType[type]} - ${ source.name }`, fileName );
            return audioFile;
        },
        rawFileOf ( question:Question,  type:AudioType ){
            let fileName = `${type} - ${( question.number+"").padStart(3, "0") } - ${ question.question }.raw`;
            fileName = fileName.replace( regexp, "" );
            let rawFile;
            let LabelType:{[p in typeof type]:string} = {
                "Q+A": "Q&A",
                Question: "Question",
                Answer: "Answer",
                Important: "Q&A"
            }
            rawFile = Path.join( rawFolder, type, `${LabelType[type]} - ${ source.name }`, fileName );
            return rawFile;
        }
    }
}

export type ConvertOptions = {
    "convertQ+A"?:boolean,
    convertQuestion?:boolean,
    convertAnswer?:boolean
}
export function conversionCore(source:Source, audioFolder:string, rawFolder:string, opts:ConvertOptions ){


    let fdir = fileDirections( source, audioFolder, rawFolder );

    return new Promise( ( resolve ) => {

        if( fs.existsSync(Path.join( audioFolder, "Important" ) ) )
            fs.rmSync(Path.join( audioFolder, "Important" ), { recursive: true });

        readQuestions( source.filename, source.name ).then( readQuestions => {
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

                if( _current.change || ( !fs.existsSync( fdir.audioFileOf( _current, "Question" )) && opts.convertQuestion ) ) _current.convertedQuestion = false;
                if( _current.change || ( !fs.existsSync( fdir.audioFileOf( _current, "Answer" )) && opts.convertAnswer ) ) _current.convertedAnswer = false;
                if( _current.change || ( !fs.existsSync( fdir.audioFileOf( _current, "Q+A" )) && opts["convertQ+A"] ) ) _current["convertedQ+A"] = false;

                readQuestions.save();

                let convert = _current.change
                    || !_current["convertedQ+A"]
                    || !_current.convertedAnswer
                    || !_current.convertedQuestion
                ;

                let workName = `Convert question ${ _current.number } from ${ source.name } | ${ _current.question }`;
                console.log( workName, "..." );
                if( !convert ){
                    console.log( workName, "... skip!" );
                    return next( _current );
                }

                let isPair = _current.number%2 === 0;
                let voice = isPair? source.configs.translate[2] : source.configs.translate[1];

                let Jobs:{[p in "Q&A"|"question"|"answer"|"Q+A"]?:()=>Promise<boolean>} = {
                    question: () => {
                        return new Promise( ( jobResolve ) => {
                            let text = `${ _current.question }`;
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
                        return new Promise( (jobResolve) => {
                            let text = `${ _current.answer }`;
                            let audioFile = fdir.audioFileOf( _current, "Answer" );
                            let rawFile = fdir.rawFileOf( _current, "Answer" );

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
                    }, "Q+A"(){
                        return new Promise( jobResolve => {
                            let audios:string[] = [
                                ... breakTimeAudios( 1 ),
                                fdir.audioFileOf( _current, "Question" ),
                                ... breakTimeAudios( timePause( _current.answerLength ) ),
                                fdir.audioFileOf( _current, "Answer" ),
                                ... breakTimeAudios( 3 )
                            ];

                            let audioFile = fdir.audioFileOf( _current, "Q+A" );
                            if( fs.existsSync( audioFile ) ) fs.unlinkSync( audioFile );
                            audioJoin( {
                                files: audios,
                                concatFile: audioFile
                            }).then( error => {
                                if( error ) return jobResolve( false );
                                _current["convertedQ+A"] = true;

                                fixJoinedAudio( audioFile ).then( value => {
                                    jobResolve( true );
                                })
                            })
                        });
                    }, /*"Q&A"(){
                        // return new Promise( jobResolve => {
                        //
                        //     let percent = ( _current.answerLength * 1.0 )/readQuestions.maxAnswerLength;
                        //     let time = (DIFF_TIME_PAUSE*percent)+MIN_TIME_PAUSE;
                        //     let seconds = Math.round(time);
                        //
                        //     let text = `<break time="2s"/>${_current.question}<break time="${seconds}s"/>\n${_current.answer}<break time="${END_TIME_PAUSE}s"/>`;
                        //     let audioFile = fdir.audioFileOf( _current, "Q&A" );
                        //     let rawFile = fdir.rawFileOf( _current, "Q&A" );
                        //
                        //     ttlOptions.voice = voice.voiceName;
                        //     ttlOptions.voiceType = voice.voiceType;
                        //     ttlOptions.voiceGender = voice.voiceGender;
                        //     ttlOptions.text  = text;
                        //     ttlOptions.audioFileName = audioFile;
                        //     ttlOptions.language = `${ workName } ... CREATED Q&A`;
                        //
                        //     console.log( "use time pause", seconds )
                        //
                        //     ttsManager.convert( ttlOptions ).then( rawQA => {
                        //         if( !rawQA ) return jobResolve( false );
                        //         fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                        //         fs.writeFileSync( rawFile, rawQA );
                        //         _current.converted = true;
                        //         jobResolve(  true );
                        //     })
                        // })
                    }*/
                }


                let useJobs:(()=>Promise<boolean>)[] = [];
                if( opts.convertQuestion && !_current.convertedQuestion ) useJobs.push( Jobs["question"]);
                if( opts.convertAnswer && !_current.convertedAnswer ) useJobs.push( Jobs["answer"]);
                if( opts["convertQ+A"] && !_current["convertedQ+A"] ) useJobs.push( Jobs["Q+A"]  );

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
            };

            let next = ( _preview:Question )=>{
                if( !!_preview && _preview.important ){
                    let audioFile = fdir.audioFileOf( _preview, "Q+A" );
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
