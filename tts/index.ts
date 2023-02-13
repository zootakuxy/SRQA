import {freetts} from "./api/freetts.com";
import {text2speechGoogleapis} from "./api/texttospeech.googleapis.com/text2speechGoogleapis";

export class TTSManager {
    engines = [ freetts, freetts ];
    conversion = false;
    convert( language:string, voice:string, text:string, audioFileName:string, label:string ):Promise<string>{
        if( !this.conversion ) {
            this.conversion = true;
        }
        return new Promise( resolve => {
            let next=()=>{
                let current = this.engines.shift();
                if( typeof current !== "function" ) return resolve( null );
                this.engines.push( current );
                current( language, voice, text, audioFileName ).then( value => {
                    if( value ) console.log( `[${  current.name}]`, label, new URL( `file://${ audioFileName }` ).href );

                    if( value || !this.engines.length ) return resolve( value );
                    else if( this.engines.length ) {
                        console.log( `Remove engine ${ current.name }`)
                        this.engines.pop();
                        next();
                    }
                })
            }
            next();
        })
    }
}