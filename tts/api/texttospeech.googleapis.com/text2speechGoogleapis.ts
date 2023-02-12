import axios from "axios";
import * as Path from "path";
const fs = require('fs');

//https://cloud.google.com/text-to-speech?hl=pt-br

let token =
    "https://cxl-services.appspot.com/proxy?url=https%3A%2F%2Ftexttospeech.googleapis.com%2Fv1beta1%2Ftext%3Asynthesize&token=03AFY_a8XFwsNRltBqPxhLkLEC82c7VQLmpVv7bL9On9kEGoawAfgVHpyzell3QHph81NosHAYc610KALiMYaICQgmpEWNOZbAjvBgF9ERJrVOx6x1uRNNEC7zkDmhPfIOhpjQcMYVsnREolehcw8QQTqLYK6oljq-vDzqGFwSKUAN7FyH2GaQ0xhGWtnyGjhfigiH6_FpmF8a7eVz0uAQ0pgTeERfRHAYDV6FontETtViG08Xpyxd_yHl6tdILtrz7X9KMyl26yKOFS0awse44xY5THnzULwQAEqVwuWejj_XqYmvbQWjmrKVRPl20MeV8lTDl8NJQPZcPRBd7xi1rvCZgCIO2w98Ngq26j-kETp7Zs5nKKdqxrrE1xuCDMpHaihVSSHLX80yH5XsKza9SdpOrfRUsJQ_07rBG-nOqpMYk99WhKRyKhnzohJWtyqNDGA1FXtOiMPxx0cAfWlrN9IGHQvL_Fn5yJzs4f6fCcAiMskkWdhwLKG1to8MxcCYqxgMevOVQ01nnYgFPOLKglHEWexnrbhg_g";
export const urlTokens = [
    token
];
export function text2speechGoogleapis( language:string, voice:string, text:string, audioFileName:string ):Promise<string>{
    let tokens = [ ...urlTokens ];
    return new Promise( (resolve ) => {
        let _next = ()=>{
            let token = tokens.shift();

            let _try = ( attempts )=>{
                if( !token ) return resolve( null );
                const options = {
                    method: 'POST',
                    url: token,
                    data: {
                        "audioConfig": {
                            "audioEncoding": "LINEAR16",
                            "effectsProfileId": [
                                "wearable-class-device"
                            ],
                            "pitch": 0,
                            "speakingRate": 1
                        },
                        "input": {
                            "ssml": `<speak>${text}</speak>`
                        },
                        "voice": {
                            "languageCode": language,
                            "name": voice
                        }
                    }
                };

                axios.request(options).then(function ( response) {
                    let ok = response.status === 200 && !!response.data.audioContent && typeof response.data.audioContent === "string";
                    if( !ok && attempts-- > 0 ){
                        console.log( "response.status", response.status );
                        console.log( "response.statusText", response.statusText );
                        console.log( "response.data", response.data );
                        return setTimeout( ()=>{
                            _try( attempts );
                        }, 1000  );
                    } else if( !ok ){
                        console.log( "response.status", response.status );
                        console.log( "response.statusText", response.statusText );
                        console.log( "response.data", response.data );
                        return _next();
                    }

                    // let wavUrl = "data:audio/wav;base64," + response.data.audioContent;
                    // const buffer = Buffer.from(
                    //     wavUrl.split('base64,')[1],  // only use encoded data after "base64,"
                    //     'base64'
                    // )

                    fs.mkdirSync( Path.dirname(audioFileName), { recursive: true } );
                    let buffer = Buffer.from( response.data.audioContent, "base64" ); // only use encoded data after "base64,"
                    fs.writeFileSync( audioFileName, buffer );
                    setTimeout( ()=>{
                        resolve( response.data.audioContent );
                    }, 1000 * (Math.random()*3))
                }).catch(function (error) {
                    if(  attempts-- > 0 ){
                        return setTimeout( ()=>{
                            _try( attempts );
                        }, 1000 * 2 );
                    } else {
                        console.log( error );
                        return _next();
                    }

                });
            }

            _try( 5 );
        }

        _next();
    })
}
