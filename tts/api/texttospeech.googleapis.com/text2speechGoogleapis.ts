import axios from "axios";
import * as Path from "path";
const fs = require('fs');

//https://cloud.google.com/text-to-speech?hl=pt-br

let token =
    "https://cxl-services.appspot.com/proxy?url=https%3A%2F%2Ftexttospeech.googleapis.com%2Fv1beta1%2Ftext%3Asynthesize&token=03AFY_a8USoVc7VA-MyD8Uf6-6SiApiJ5du5-74dG1uYHRANpAVHz-MQXAgSaKtdl_BfzOcNSUVSqegFZY3hvCML0RLLvF0rxhB6CYQiYbstogMFTLjgAe7LEzoMcSh481Yb1UjtI090Ql5hRuleGB8LwipHaCsTajP3WrNoH4ISs08HFxEz4PKW4XOtxXyW_U6DTR6mo64HsKqW6YxHGzc1CjiOaprTx_htV5fb-uDmcyIymqw-x1bPRLHWrQMRPOpgbRwy3ukMZs6YGLzSbUL0hV850lRhsj7c5zISwGFsKWTqgc0BS9XY36Aa7onpcDfUjvjQHPkRZGweKOG0sYlrdxB84z67yUKsnKidaBm8mdBxYd_D0r9WJcYW3VMncAl1lBdJSxkPSXq3mUEljMAgeHo3v0MYYGJBITAh69Ux-nJAx5vqG4ZRHBD4NPKPsqAEruUbNqEmFgjuPRdpPEZSKDRgVVPZBNbuhHomBZtvPYwPSoAM25gRFygkH8EQUOlo-Uoy4KQ8F5sx5yQfiN7y-BTpqi1_UvcA"
;
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
