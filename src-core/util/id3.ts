import NodeID3, { Tags } from "node-id3";
import {Question} from "../qa";
import {AudioType, FileDirections} from "../convert/core";
import * as Path from "path";
export function id3Question( fileDirection:FileDirections, question:Question ){
    return new Promise((resolve ) => {
        let type = question.type
        let Label: { [p in typeof type]: string } = {
            mechanics: "Mecanica",
            theoretic: "Teorica"
        };
        //language=file-reference

        //language=file-reference
        let Image: { [p in typeof type]: string } = {
            mechanics: Path.join(__dirname, "../../source/assets/zootakuxy-mechanic.png"),
            theoretic: Path.join(__dirname, "../../source/assets/zootakuxy-theoretic.png")
        };

        let typeChar = type[0].toUpperCase();
        let title = `${question.order} ${typeChar}${(question.number + "").padStart(3, "0")} ${question.question}`;
        console.log(title);
        let tag: Tags = {
            title: title,
            artist: "Daniel Costa",
            trackNumber: `${question.order}`,
            album: `Trânsito Aulas ${Label[type]}`,
            language: "pt-PT",
            copyrightUrl: "https://github.com/zootakuxy",
            copyright: "@zootakuxy",
            publisher: "https://texttospeech.googleapis.com",
            image: Image[type],
            comment: {
                language: "pt-PT",
                text: question.answer
            }
        }

        let audiosType: AudioType[] = [
            "Q+A",
            "Question",
            "Answer"
        ];

        let procede = ()=>{
            let type = audiosType.shift();
            if( !type ) {
                return resolve( "ID3" );
            }
            tag.genre = type;
            NodeID3.write({ ...tag }, fileDirection.audioFileOf( question, type ), ()=>{
                if( question.important && type === "Q+A" ){
                    tag.album="TOP";
                    return NodeID3.write( { ...tag }, fileDirection.audioFileOf( question, "Important" ), () => {
                        console.log( "[id3] create metadata of", question.number)
                        procede();
                    })
                } else {
                    console.log( "[id3] create metadata of", question.number)
                    procede()
                }
            });
        }

        procede();
    })

}
