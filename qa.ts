import * as fs from "fs";
import * as readline from "readline";
import * as json5 from "json5";

export interface Question{
    important:number,
    question:string,
    answer:string,
    number:number,
    type:string|"mechanics"|"theoretic",
    change:boolean,
    converted:boolean
}

export function readQuestions( qaFile: string, type:string ):Promise<{
    save(),
    questions:Question[]
}>{

    return new Promise( ( resolve ) => {
        let iLine = readline.createInterface(fs.createReadStream( qaFile ));
        let questionsList:Question[] = [];

        iLine.on("line", line => {
            line = line.trim();
            if( line.length < 1 ) return;

            let index = Number( line.split("-")[ 0 ] );
            let endAsQuestion = line.endsWith("?");
            let isQuestion = Number.isFinite( index )
                && !Number.isNaN( index )
                && endAsQuestion;

            if( isQuestion ){
                let important = line.split( "!" );
                let realQuestion = important.filter( value => value.length ).join("");
                let parts = realQuestion.split("-");

                parts.map( (value ) => {
                    value = value.trim();
                    if( value.length < 1 ) value = null;
                    return value;
                }).filter( (value)=> !!value );

                parts.shift();
                let question:Question = {
                    important: important.length-1,
                    question: parts.join( "-"),
                    answer: "",
                    number: index,
                    type: type,
                    change: true,
                    converted: false,
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

            questionsList.forEach( value => {
                let findQuestion = last.find( value1 => value1.number === value.number );
                value.change = !findQuestion
                    || findQuestion.question !== value.question
                    || findQuestion.answer !== value.answer;

                value.converted = !!findQuestion && findQuestion.converted && !value.change;
            });
            resolve( {
                questions: questionsList,
                save() {
                    fs.writeFileSync( qaFile+".json5", json5.stringify( questionsList, {
                        space: "  "
                    } ) )
                }
            } );
        })
    })
}
