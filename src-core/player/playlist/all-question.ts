import {AUDIO_FOLDER, converterConfigs, RAW_FOLDER} from "../../load";
import {readQuestions} from "../../qa";
import {fileDirections} from "../../convert/core";
import Path from "path";
import {QuestionPlay} from "../index";

export type LoadQuestionsOptions = {
    sourceName?:string[]
}


export function loadQuestion( filter?:LoadQuestionsOptions ):Promise<QuestionPlay[]>{
    return new Promise( resolve => {
        let questions:QuestionPlay[] = [];

        let _sources = converterConfigs.sources.filter( value => {
            return ((Array.isArray(filter?.sourceName )  && filter?.sourceName.includes( value.name )) || !filter?.sourceName);
        });

        let next =()=>{
            let source = _sources.shift();
            if( !source ) {
                return resolve( questions );
            }

            readQuestions( source.filename, source.name ).then( readQuestionList => {
                questions.push( ...readQuestionList.questions.map( question => ({
                    ...question,
                    //language=file-reference
                    fdir: fileDirections( source, AUDIO_FOLDER, RAW_FOLDER )
                })));
                next();
            });
        }
        next();
    })
}
