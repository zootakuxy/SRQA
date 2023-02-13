import axios from "axios";
const fs = require('fs');
import querystring from "querystring";
import https from "https";
import http from "http";
import * as Path from "path";

let engine:typeof https|typeof http;

let urlBase = "https://freetts.com";
let createAudioUrl = `${urlBase}/Home/PlayAudio`;
let getAudioUrl = `${urlBase}/audio`;

if ( urlBase.startsWith("https") ) engine = https
else engine = http;

export function freetts(language:string, voice:string, text:string, audioFileName:string ):Promise<string>{
    return new Promise( (resolve ) => {
        let request = {
            Language:language,
            Voice:voice,
            TextMessage:text,
            type:0
        }

        let query = querystring.encode( request );
        let requestUrl = `${createAudioUrl}?${query}`;

        let _convert = attempts =>{

            if( attempts-- === 0 ) {
                return resolve ( null );
            }

            axios.get( requestUrl, { }).then( response => {
                let ok = response.status === 200
                    && !!response.data
                    && typeof response.data === "object"
                    && response.data.msg === "True"
                    && response.data.counts > 0
                    && !!response.data.id
                ;

                if( !ok ){
                    console.log( "response.status", response.status );
                    console.log( "response.statusText", response.statusText );
                    console.log( "response.data", response.data );
                    return setTimeout( ()=>{
                        _convert( attempts );
                    }, 1000 * ( 5 * Math.random() ));
                }

                let audioId = response.data.id;
                let url = `${getAudioUrl}/${audioId}`;
                fs.mkdirSync( Path.dirname( audioFileName ), { recursive: true } );
                let stream = fs.createWriteStream( audioFileName );
                return engine.get( url, request=>{
                    request.pipe( stream );
                    return request.on( "close", () => {
                        stream.close();
                        let bitmap = fs.readFileSync( audioFileName );
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
