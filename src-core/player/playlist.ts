
import {Player, PlayOptions, QuestionPlay, timePause} from "./index";

export type PlaylistOptions =  {
    playlist: QuestionPlay[],
    name: string
}
export type QuestionPlayed = {
    number:number,
    question:string,
    repeat?:number
}
export type PlaylistStatus = {
    played:QuestionPlay[]
}


export class Playlist {
    private readonly _playlist:QuestionPlay[];
    private player:Player;
    public name:string;
    public status:PlaylistStatus;

    constructor( opts:PlaylistOptions ) {
        this._playlist = opts.playlist;
        this.name = opts.name;
    }

    onAttach( player:Player, status:PlaylistStatus ){
        this.player = player;
        this.status = status;
    }


    get playlist(): QuestionPlay[] {
        return this._playlist;
    }

    public play( opts:PlayOptions ):Promise<boolean>{
        return new Promise( resolve => {
            let list = this._playlist.filter( value => {
                return !this.status.played.find( next =>
                    next.number === value.number
                    && next.question === value.question
                )
            });

            if( !list.length ){
                this.status.played.length = 0;
                list = [ ...this._playlist ];
                this.player.saveStatus( this );
            }

            console.log( "Playing", list.length, "questions of", this._playlist.length );
            if( opts.random ) list = this.shuffle( list );
            let first = list.shift();

            let next = ( question:QuestionPlay )=>{

                let _playNext = ( _preview:QuestionPlay )=>{
                    if( _preview ) {
                        this.status.played.push( _preview );
                        this.player.saveStatus( this );
                    }
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
                        if( !value )  return _playNext( null );
                        this.player.playFile( question.fdir.audioFileOf( question, "Answer" ) ).then(value => setTimeout( ()=>{
                            _playNext( question );
                        }, 3*1000) );
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
