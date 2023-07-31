import * as fs from "fs";

require("source-map-support").install()
import Path from "path";

import sound from "sound-play";
import {Question} from "../qa";
import { FileDirections} from "../convert/core";
import {Playlist, PlaylistStatus} from "./playlist";

export type QuestionPlay = Question & { fdir:  FileDirections }

export interface PlayOptions {
    theme:boolean,
    replay:boolean,
    replayAll:boolean,
    random:boolean,
    themeFile: string,
    themeVolume:number,
    themeVolumeScale: number
}

export interface PlayerOptions {
    dirname:string
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
            status = { played:[], playlist:[] }
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
        let withTheme = false;
        if( opts.theme && opts.themeFile &&  fs.existsSync( opts.themeFile )){
            withTheme  =true;
            let playThem = ()=>{
                return new Promise( resolve => {
                    console.log( "Playing theme...")
                    let scale = opts.themeVolumeScale || 100;
                    let volume = opts.themeVolume || 5;
                    let scaleVolume = volume/scale;
                    this.playIn( opts.themeFile, `current-theme${Path.extname( opts.themeFile )}`, scaleVolume )
                        .then( value => {
                            console.log( { value })
                            playThem().then( value1 => {

                            });
                        }).catch( reason => {
                        console.log( reason )
                    })
                })
            }
            playThem().then( value => {

            })
        }


        let _playlist = [ ...this.playlist ];

        return new Promise((resolve, reject) => {
            let next = ()=>{
                let _next = _playlist.shift();
                return _next.play( opts );
            }
            if( withTheme ){
                setTimeout( ()=>{
                    next().then( value => resolve( value ));
                }, 1000 );
            } else next().then( value => resolve( value ))
        })

    }
    playFile( filename:string ):Promise<boolean>{
        return this.playIn( filename, "current-audio.mp3", 1 );
    }

    private playIn( filename:string, inName:string, volume:number ):Promise<boolean>{
        return new Promise( resolve => {

            if( !fs.existsSync( filename ) ) {
                console.log( "file not found", filename );
                return resolve( false );
            }
            let filePlay = Path.join( this.dirname, inName);
            console.log( { filename, inName, volume,filePlay });
            if( !fs.existsSync( Path.dirname(filePlay))) fs.mkdirSync( Path.dirname( filePlay ));
            fs.copyFileSync( filename, filePlay );
            filePlay = filename;
            if( !filePlay.startsWith(`"`) && !filePlay.endsWith(`"`) ) filePlay = `"${filePlay}"`
            sound.play( filePlay, volume ).then( value => {
                return resolve( true );
            });
        });
    }
}



