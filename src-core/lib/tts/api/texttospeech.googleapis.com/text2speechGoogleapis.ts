import axios from "axios";
import * as Path from "path";
const fs = require('fs');

//https://cloud.google.com/text-to-speech?hl=pt-br

let token =
    "https://cxl-services.appspot.com/proxy?url=https://texttospeech.googleapis.com/v1beta1/text:synthesize&token=03AFY_a8VWxervnSxm1sV0s_DPk4q_h57dTaOb7mr_L07j1Vg9J2aa9y24zCOZKTwDPd0yVUUmFA7dn29WJa7D6XnI0-7NCiWbR_52dw1Rm8bM1Xo8ZblkukapMTF4qtzT1ePTNch89f4JDocgcFPz9r1JvcrZ_6hfxpX7iwU9yiTYYZzjj-nxtLQ00nzg1Ga92tTUIC_5_ZsHRxPdkpqs5jQefXTYkiuObHuPQ0mPLZFlbhRrwt4_Yik4r8eI36lptWQ8keQ5nbXvRKXR15pDgVIJrotxUEvMRc_-EKSSalyvboqiR7tExhhOkTdVi9RMAlGiDaDDwH2QUpaQZPpMhubKnAljMzYmVW5ioqeyJPYLsi797QwxGDhxkTj8BtJUfygpekvbKky2WzY6wRH-QMuy5bHEh33HZnDpoAhkyUxpm1i8dE2Zds_va_fuLCMAu02El00g3-hhIteJblM-B3oac2dFC9RCiGs1LvhnQ5SB-8YK7G8JSf4XbfNAoaqSMM_TDm-fNOwJ1qGQXZSwqrqi6UCGFArKXA"
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
