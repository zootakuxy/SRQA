import * as fs from "fs";
import * as readline from "readline";
import * as json5 from "json5";
import * as Path from "path";

export interface Question{
    important:number,
    question:string,
    answer:string,

    number:number,
    indexNumber:number
    type:string|"mechanics"|"theoretic",
    change:boolean,
    converted:boolean
    convertedQuestion:boolean
    convertedAnswer:boolean,
    questionLength:number,
    answerLength:number,
    answerWords:number,
    questionsWords:number
}

export function readQuestions( qaFile: string, type:string ):Promise<{
    save(),
    questions:Question[],
    minAnswerLength:number,
    maxAnswerLength:number
}>{

    return new Promise( ( resolve ) => {
        let baseName = Path.basename( qaFile, ".txt" );
        let listFile = Path.join( Path.dirname( qaFile ), `${baseName}.list` );
        let minLength = -1;
        let maxAnswerLength = -1;

        let list = [];

        if( fs.existsSync( listFile ) ){
            list = fs.readFileSync( listFile )
                .toString()
                .trim()
                .split( "\n" )
                .filter( value => value && value.trim().length )
                .map( value => Number( value.trim() ) )
            ;
        }

        let iLine = readline.createInterface(fs.createReadStream( qaFile ));
        let questionsList:Question[] = [];

        iLine.on("line", line => {
            line = line.trim();
            if( line.length < 1 ) return;

            if( line.startsWith("//") || line.startsWith("#") ) return;

            let index = Number( line.split(/[-–]/)[ 0 ] );
            let endAsQuestion = line.endsWith("?");
            let isQuestion = Number.isFinite( index )
                && !Number.isNaN( index )
                && endAsQuestion;

            if( isQuestion ){
                let important = line.split( "!" );
                let realQuestion = important.filter( value => value.length ).join("");
                let parts = realQuestion.split(/[-–]/);

                parts.map( (value ) => {
                    value = value.trim();
                    if( value.length < 1 ) value = null;
                    return value;
                }).filter( (value)=> !!value );

                parts.shift();
                let questionName = parts.join( "-");
                let question:Question = {
                    important: important.length-1,
                    question: questionName,
                    answer: "",
                    number: index,
                    type: type,
                    change: true,
                    converted: false,
                    convertedQuestion: false,
                    convertedAnswer: false,
                    indexNumber: list.indexOf( index )+11,
                    questionLength: questionName.length,
                    answerLength: 0,
                    questionsWords: 0,
                    answerWords: 0
                }
                questionsList.push( question );
            } else {
                let question = questionsList[ questionsList.length-1 ];
                if( !question ) return;
                question.answer+="\n"+line;
            }
        });

        iLine.on( "close", () => {
            let last:Question[] = [];
            let exists = fs.existsSync( qaFile+".json5" );
            if( exists ){
                last = json5.parse( fs.readFileSync(qaFile+".json5").toString("utf-8" ) );
            }

            questionsList = questionsList.filter( value =>
                !!value.question.trim().length
                && !!value.answer.trim().length
                && value.number !== null
                && value.number !== undefined
            )

            questionsList.forEach( value => {
                let length = value.answer.length;
                if( minLength === -1 || maxAnswerLength === -1 ) {
                    minLength = length;
                    maxAnswerLength = length;
                }
                value.question = value.question.trim();
                value.answer = value.answer.trim();
                value.answerLength = length;
                value.questionsWords = value.question.split(" " ).length;
                value.answerWords = value.answer.split(" " ).length;

                if( length < minLength ) minLength = length;
                if( length > maxAnswerLength ) maxAnswerLength = length;

                let findQuestion = last.find( value1 => value1.number === value.number );
                value.change = !findQuestion
                    || findQuestion.question.trim() !== value.question.trim()
                    || findQuestion.answer.trim() !== value.answer.trim();

                value.converted = !!findQuestion && findQuestion.converted && !value.change;
                value.convertedQuestion = !!findQuestion && findQuestion.convertedQuestion && !value.change;
                value.convertedAnswer = !!findQuestion && findQuestion.convertedAnswer && !value.change;
            });
            resolve( {
                questions: questionsList,
                minAnswerLength: minLength,
                maxAnswerLength: maxAnswerLength,
                save() {
                    fs.writeFileSync( qaFile+".json5", json5.stringify( questionsList, {
                        space: "  "
                    } ) )
                }
            } );
        })
    })
}
