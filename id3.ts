import NodeID3, { Tags } from "node-id3";
import {Question} from "./qa";
import {FileDirections} from "./converter";
import * as Path from "path";
export function id3Question( fileDirection:FileDirections, question:Question ){
    return new Promise((resolve ) => {
        let type = question.type
        let Label:{[p in typeof type]:string} = {
            mechanics: "Mecanica",
            theoretic: "Teorica"
        };
        let Track:{[p in typeof type]:number} = {
            mechanics: 1,
            theoretic: 2
        };
            //language=file-reference

        //language=file-reference
        let Image:{[p in typeof type]:string} = {
            mechanics: Path.join( __dirname, "source/assets/mechanic.jpg" ),
            theoretic: Path.join( __dirname, "source/assets/security.jpg" )
        };

        let typeChar  = type[ 0 ].toUpperCase();
        let tag:Tags = {
            title: `${ typeChar }${ (question.number+"").padStart( 3, "0" )} ${question.question}`,
            artist: "Daniel Costa",
            trackNumber: `${question.number}/${Track[type]}`,
            album: `Trânsito Aulas ${ Label[type] }`,
            language:"pt-PT",
            copyrightUrl: "https://github.com/zootakuxy",
            copyright:"@zootakuxy",
            publisher:"https://texttospeech.googleapis.com",
            //language=file-reference
            image: Image[type],
            comment:{
                language: "pt-PT",
                text: question.answer
            }
        }

        tag.genre= `Question`;
        NodeID3.write({...tag}, fileDirection.audioFileOf( question, "Question" ), ()=>{
            tag.genre = "Answerer";
            NodeID3.write({...tag}, fileDirection.audioFileOf( question, "Response" ), () =>{
                tag.genre = "Q&A";
                NodeID3.write({...tag}, fileDirection.audioFileOf( question, "Q&A" ), ()=>{
                    console.log( "[id3] create metadata of", question.number)
                    resolve( "ID3" );
                });
            });
        });
    });
}
