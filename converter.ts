import {Source} from "./load";
import {Question, readQuestions} from "./qa";
import * as Path from "path";
import * as fs from "fs";
import {TTSManager} from "./tts";
import {normalizeDiacritics} from "normalize-text";
import {id3Question} from "./id3";

let regexp = /[^a-zA-Z0-9\s\-._&]/g;

let ttsManager = new TTSManager();

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


export function converter( source:Source, audioFolder:string, rawFolder:string ){

    let fdir = fileDirections( source, audioFolder, rawFolder );

    return new Promise( ( resolve ) => {

        if( fs.existsSync(Path.join( audioFolder, "Important" ) ) )
            fs.rmSync(Path.join( audioFolder, "Important" ), { recursive: true });

        readQuestions( source.filename, source.name ).then( readQuestions => {
            let questions = [ ...readQuestions.questions ];

            let _process = ()=>{
                let _current = questions.shift();
                if( !_current ) return resolve( source );
                let convert = _current.change
                    || !_current.converted
                    || !fs.existsSync( fdir.audioFileOf( _current, "Question" ))
                    || !fs.existsSync( fdir.audioFileOf( _current, "Response" ))
                    || !fs.existsSync( fdir.audioFileOf( _current, "Q&A" ))
                ;
                let workName = `Convert question ${ _current.number } from ${ source.name } `;
                console.log( workName, "..." );
                if( !convert ){
                    console.log( workName, "... skip!" );
                    return next( _current );
                }
                let isPair = _current.number%2 === 0;

                let voice = isPair? source.configs.translate.voice2 : source.configs.translate.voice1;

                let text;

                text = `<break time="1s"/>${_current.question}<break time="15s"/>`;
                let audioFile = fdir.audioFileOf( _current, "Question" );
                let rawFile = fdir.rawFileOf( _current, "Question" );
                ttsManager.convert( source.configs.translate.language, voice, _current.question, audioFile,  `${ workName } ... CREATED QUESTION` ).then( rawQuestion => {
                    if( !rawQuestion ) return resolve( false );

                    fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                    fs.writeFileSync( rawFile, rawQuestion );

                    audioFile = fdir.audioFileOf( _current, "Response" );
                    rawFile = fdir.rawFileOf( _current, "Response" );
                    ttsManager.convert( source.configs.translate.language, voice, _current.answer, audioFile, `${workName} ... CREATED ANSWER` ).then( rawAnswer => {
                        if( !rawAnswer ) return resolve( false );
                        fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                        fs.writeFileSync( rawFile, rawAnswer );

                        text = `<break time="1s"/>${_current.question}<break time="10s"/>\n${_current.answer}<break time="5s"/>`;

                        audioFile = fdir.audioFileOf( _current, "Q&A" );
                        rawFile = fdir.rawFileOf( _current, "Q&A" );
                        ttsManager.convert( source.configs.translate.language, voice, text, audioFile, `${workName} ... CREATED Q&E` ).then( rawQA => {
                            if( !rawQA ) return resolve( false );
                            fs.mkdirSync( Path.dirname( rawFile ), { recursive: true } );
                            fs.writeFileSync( rawFile, rawQA );
                            _current.converted = true;
                            readQuestions.save();
                            console.log( workName, "...ok!" );

                            next( _current );
                        })
                    })
                });
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