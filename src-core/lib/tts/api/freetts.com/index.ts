import axios, {AxiosHeaders} from "axios";
const fs = require('fs');
import https from "https";
import http from "http";
import * as Path from "path";
import {TTLOptions} from "../../index";
import {etc} from "../../../../load";
import {sort} from "fast-sort";
import * as console from "console";

let engine:typeof https|typeof http;

let urlBase = "https://freetts.com";
let createAudioUrl = `${urlBase}/api/TTS/SynthesizeText`;

if ( urlBase.startsWith("https") ) engine = https
else engine = http;


let tokens:({credit:number, key:string, name?:string})[] = [];
Object.keys( etc.document.freetts.token ).forEach( (key,  index)=>{
    let bearer = etc.document.freetts.token[ key ];
    bearer.credit = Number( bearer.credit );
    bearer.name = bearer.name || `token-${ index+1 }`;
    if( !Number.isSafeInteger( bearer.credit ) ) bearer.credit = 9999;
    tokens.push( bearer );
});

//Portuguese (Portugal)

export function freetts( opts:TTLOptions ):Promise<string>{
    return new Promise( (resolve ) => {


        let _convert = attempts =>{

            if( attempts-- === 0 ) {
                return resolve ( null );
            }

            let useToken = sort(tokens.filter( value => {
                return value.credit > opts.text.length
            })).by([
                { desc: prop => Number(prop.credit) }
            ])[0];

            if( !useToken ) return resolve( null );

            let header:AxiosHeaders = new AxiosHeaders();
            header.set("Authorization", useToken.key );

            let requestData ={
                "text":opts.text,
                "type":0,
                "ssml":(opts.ssml)?1:0,
                "isLoginUser":1,
                "country":opts.country,
                "voiceType":opts.voiceType,
                "languageCode": opts.language,
                "voiceName": opts.voice,
                "gender":opts.voiceGender
            }


            console.log( "Using  token id", useToken.name, "with credit of", useToken.credit, "characters.")
            axios.post( createAudioUrl, requestData, {
                headers: header
            }).then( response => {
                let ok = response.status === 200
                    && !!response.data
                    && !!response.data.data
                    && typeof response.data === "object"
                    && typeof response.data.data === "object"
                    && response.data.msg === "Success"
                    && response.data.data.downloadCount > 0
                    && typeof response.data.data.audiourl === "string"
                    && (response.data.data.audiourl as string).startsWith("https://freetts.com/results/")
                    && (response.data.data.audiourl as string).endsWith(".mp3")
                ;

                useToken.credit = response.data.data.downloadCount;
                if( !useToken.credit ) useToken.credit = 0;
                etc.save();

                if( !ok ){
                    console.log( "response.status", response.status );
                    console.log( "response.statusText", response.statusText );
                    console.log( "response.data", response.data );
                    return setTimeout( ()=>{
                        _convert( attempts );
                    }, 1000 * ( 5 * Math.random() ));
                }

                let audioUrl = response.data.data.audiourl;
                fs.mkdirSync( Path.dirname( opts.audioFileName ), { recursive: true } );
                let stream = fs.createWriteStream( opts.audioFileName );
                return engine.get( audioUrl, request=>{
                    request.pipe( stream );
                    return request.on( "close", () => {
                        stream.close();
                        let bitmap = fs.readFileSync( opts.audioFileName );
                        let base64 = bitmap.toString("base64" );

                        setTimeout( ()=>{
                            resolve( base64 );
                        }, 1000 * (Math.random()*5))

                    });
                } );
            }).catch( () => {
                console.log( "Error on https://freetts.com ", attempts );
                setTimeout(()=>{
                    _convert( attempts );
                }, 1000 * (Math.random()*9))
            })
        }

        _convert( 5 );
    });
}
