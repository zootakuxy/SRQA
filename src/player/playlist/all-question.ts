import {converterConfigs} from "../../load";
import {readQuestions} from "../../qa";
import {fileDirections} from "../../convert/core";
import Path from "path";
import {QuestionPlay} from "../index";

export function loadAllQuestionPlaylist(  ):Promise<QuestionPlay[]>{
    return new Promise( resolve => {
        let questions:QuestionPlay[] = [];
        let _sources = [ ...converterConfigs.sources ];

        let next =()=>{
            let source = _sources.shift();
            if( !source ) {
                return resolve( questions );
            }

            readQuestions( source.filename, source.name ).then( readQuestionList => {
                questions.push( ...readQuestionList.questions.map( question => ({
                    ...question,
                    //language=file-reference
                    fdir: fileDirections( source, Path.join( __dirname, "../../../dist/audios" ), Path.join( __dirname, "../../../dist/audios-raw" ) )
                })));
                next();
            });
        }
        next();
    })
}