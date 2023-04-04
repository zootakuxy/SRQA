
import {Player, PlayOptions, QuestionPlay, timePause} from "./index";

export type PlaylistOptions =  PlayOptions & {
}


export class PlayList {
    private readonly _playlist:QuestionPlay[];
    private player:Player;

    constructor( playlist:QuestionPlay[] ) {
        this._playlist = playlist;
    }

    onAttach( player:Player ){
        this.player = player;
    }


    get playlist(): QuestionPlay[] {
        return this._playlist;
    }

    public play( opts:PlayOptions ):Promise<boolean>{
        return new Promise( resolve => {
            let list = [ ...this._playlist ];
            if( opts.random ) list = this.shuffle( list );
            let first = list.shift();

            let next = ( question:QuestionPlay )=>{

                let _playNext = ()=>{
                    if( opts.replay ) return next( question );
                    else if( opts.replayAll ){
                        let _next = list.shift();
                        if( !_next ) return this.play( opts );
                        else return  next( _next );
                    } else {
                        return resolve( true )
                    }
                }

                let waitSecond = timePause( question.answerLength )
                console.log( question.number, "|", question.question, "| wait", waitSecond, "second" );
                this.player.playFile( question.fdir.audioFileOf( question, "Question" ) ).then( value => {
                    setTimeout( ()=>{
                        if( !value )  return _playNext();
                        this.player.playFile( question.fdir.audioFileOf( question, "Answer" ) ).then(value => setTimeout( ()=>{
                            _playNext()
                        }, 1.5*1000) );
                    }, ( waitSecond )*1000)
                })
                setTimeout( () =>{
                    console.log( question.answer );
                }, ( waitSecond/2)*1000 );
            }
            next( first );
        })
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
