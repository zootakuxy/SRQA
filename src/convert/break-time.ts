import Path from "path";
import {decompose} from "../util/decompose";

const breakTime = {
    times:[ 5, 4, 3, 2, 1, 0.5, 0.1 ],
    //language=file-reference
    pieces:{
        5: Path.join( __dirname, "../../source/break-times/5s.mp3" ),
        4: Path.join( __dirname, "../../source/break-times/4s.mp3" ),
        3: Path.join( __dirname, "../../source/break-times/3s.mp3" ),
        2: Path.join( __dirname, "../../source/break-times/2s.mp3" ),
        1: Path.join( __dirname, "../../source/break-times/1s.mp3" ),
        0.5: Path.join( __dirname, "../../source/break-times/0.5s.mp3" ),
        0.1: Path.join( __dirname, "../../source/break-times/0.1s.mp3" ),
    }
}

export function breakTimeAudios(time:number ):string[]{
    return decompose(time, breakTime.times ).map( value => {
       return breakTime.pieces[ value];
    });
}
