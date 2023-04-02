import * as fs from "fs";

require("source-map-support").install()
import {FileDirections, fileDirections, MIN_TIME_PAUSE} from "./converter";
import {converterConfigs} from "./load";
import Path from "path";
import {Question, readQuestions} from "./qa";

import sound from "sound-play";

export type QuestionPlay = Question & {
    fdir:  FileDirections
}
export function listen(){
    let questions:QuestionPlay[] = [];
    let _sources = [ ...converterConfigs.sources ];
    let next =()=>{
        let source = _sources.shift();
        if( !source ) {
            let playlist = new PlayList( questions, {
                replay: false,
                replayAll: true,
                random: true
            });

            playlist.play();
            return;
        }

        readQuestions( source.filename, source.name ).then( readQuestionList => {
            questions.push( ...readQuestionList.questions.map( question => ({
                ...question,
                //language=file-reference
                fdir: fileDirections( source, Path.join( __dirname, "./audios" ), Path.join( __dirname, "./audios-raw" ) )
            })));
            next();
        });
    }
    next();
}

export type PlaylistOptions = {
    replay:boolean;
    replayAll:boolean;
    random:boolean;
}


class PlayList {
    private playlist:QuestionPlay[];
    private replay:boolean;
    private replayAll:boolean;
    private random:boolean;


    constructor( playlist:QuestionPlay[], opts:PlaylistOptions ) {
        this.playlist = playlist;
        this.replay = opts?.replay;
        this.replayAll = opts?.replayAll;
        this.random = opts?.random;
    }

    run( filename:string ):Promise<boolean>{
        return new Promise( resolve => {
            if( !fs.existsSync( filename ) ) return resolve( false );
            let filePlay = "C:\\var\\temp\\audio.mp3";
            fs.copyFileSync( filename, filePlay );
            sound.play( filePlay, 1).then( value => {
               return resolve( true );
            });
        });
    }

    public play(){

        let list = [ ...this.playlist ];
        if( this.random ) list = this.shuffle( list );
        let first = list.shift();

        let next = ( question:QuestionPlay )=>{

            let _playNext = ()=>{
                if( this.replay ) return next( question );
                if( this.replayAll ){
                    let _next = list.shift();
                    if( !_next ) return this.play();
                    else return  next( _next );
                }
            }

            let waitSecond = 1.5+( ( question.answerLength * 60 / 1000 )/ 2 );
            console.log( question.number, "|", question.question, "| wait", waitSecond, "second" );
            this.run( question.fdir.audioFileOf( question, "Question" ) ).then( value => {
                setTimeout( ()=>{
                    if( !value )  return _playNext();
                    this.run( question.fdir.audioFileOf( question, "Response" ) ).then( value => setTimeout( ()=>{
                        _playNext()
                    }, 2*1000) );
                }, ( waitSecond )*1000)
            })
            setTimeout( () =>{
                console.log( question.answer );
            }, ( waitSecond/2)*1000 );
        }
        next( first );
    }

    private shuffle( array:QuestionPlay[] ):QuestionPlay[] {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}

if( require.main.filename === __filename ) {
    listen()
}


