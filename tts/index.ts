import {freetts} from "./api/freetts.com";


export interface TTLOptions {
    language:string,
    voice:string,
    text:string,
    audioFileName:string,
    voiceGender:string|"MALE"|"FEMALE",
    country:string,
    voiceType:string
    label:string,
    ssml:boolean,
}

export class TTSManager {
    engines = [ freetts, freetts ];
    conversion = false;
    convert( opts:TTLOptions  ):Promise<string>{
        if( !this.conversion ) {
            this.conversion = true;
        }
        return new Promise( resolve => {
            let next=()=>{
                let current = this.engines.shift();
                if( typeof current !== "function" ) return resolve( null );
                this.engines.push( current );
                current( opts ).then( value => {
                    if( value ) console.log( `[${  current.name}]`, opts.label, new URL( `file://${ opts.audioFileName }` ).href );

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
