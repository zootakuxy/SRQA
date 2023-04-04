import * as fs from "fs";

require("source-map-support").install()
import Path from "path";

import sound from "sound-play";
import {Question} from "../qa";
import { FileDirections} from "../convert/core";
import {PlayList} from "./play-list";

export type QuestionPlay = Question & { fdir:  FileDirections }

export interface PlayOptions {
    replay:boolean,
    replayAll:boolean,
    random:boolean
}

export function timePause( charLength:number){
    return 1.5+( ( charLength * 60 / 1000 )/ 2 );
}

export class Player {

    playlist:PlayList[];

    constructor() {
        this.playlist = [];
    }

    addPlayList( audiosList:QuestionPlay[] ){
        let playList = new PlayList( audiosList );
        this.playlist.push( playList );
        playList.onAttach( this );
        return playList;
    }

    play( opts:PlayOptions ){
        let _playlist = [ ...this.playlist ];
        let next = ()=>{
            let _next = _playlist.shift();
            return _next.play( opts );
        }
        return next();
    }
    playFile( filename:string ):Promise<boolean>{
        return new Promise( resolve => {
            if( !fs.existsSync( filename ) ) return resolve( false );
            let filePlay = "C:\\var\\temp\\audio.mp3";
            fs.copyFileSync( filename, filePlay );
            sound.play( filePlay, 1).then( value => {
                return resolve( true );
            });
        });
    }
}



