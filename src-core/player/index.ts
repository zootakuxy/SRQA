import * as fs from "fs";

require("source-map-support").install()
import Path from "path";

import sound from "sound-play";
import {Question} from "../qa";
import { FileDirections} from "../convert/core";
import {Playlist, PlaylistStatus} from "./playlist";

export type QuestionPlay = Question & { fdir:  FileDirections }

export interface PlayOptions {
    replay:boolean,
    replayAll:boolean,
    random:boolean
}

export interface PlayerOptions {
    dirname:string
}

export function timePause( charLength:number){
    return 1.5+( ( charLength * 60 / 1000 )/ 2 );
}

export class Player {

    playlist:Playlist[];
    dirname:string;

    constructor( opts:PlayerOptions ) {
        this.playlist = [];
        this.dirname = opts.dirname;
    }

    addPlayList( playlistName:string, audiosList:QuestionPlay[] ){
        let playList = new Playlist( {
            name: playlistName,
            playlist: audiosList
        } );
        this.playlist.push( playList );
        let status:PlaylistStatus;
        let filename = this.filenameOf( playList );
        if( fs.existsSync( filename )){
            let raw = fs.readFileSync(filename ).toString();
            status = JSON.parse( raw );
        } else {
            status = { played:[] }
        }
        playList.onAttach( this, status );
        return playList;
    }

    private filenameOf( playlist:Playlist ){
        return Path.join(this.dirname, "playlist", `${ playlist.name }.json` );
    }

    saveStatus( playlist:Playlist){
        let filename = this.filenameOf( playlist );
        if( !fs.existsSync( Path.dirname( filename ) ) ) fs.mkdirSync( Path.dirname( filename ), { recursive: true });
        fs.writeFileSync( filename, JSON.stringify( playlist.status, null, "  " ) );
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
            if( !fs.existsSync( filename ) ) {
                console.log( "file not found", filename );
                return resolve( false );
            }
            let filePlay = Path.join( this.dirname, "current-audio.mp3" );
            fs.copyFileSync( filename, filePlay );
            sound.play( filePlay, 1 ).then( value => {
                return resolve( true );
            });
        });
    }
}



