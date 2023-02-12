require("source-map-support").install();
// import {tts} from "./texttospeech.googleapis.com/tts";
// import * as Path from "path";
//
// let player = require('play-sound')({})
//
//
//
// let text = `<break time=\"1s\"/> Em que caso um veículo está autorizado a transportar explosivos? <break time=\"15s\"/> Para transportar explosivos, deve pedir duas autorizações, uma da PSP e outra da direção de transporte e portos. Deve possuir dois extintores de incêndio em bom estado de funcionamento. Deve ainda possuir uma bandeira preta que deve ser colocado na parte superior de tejadilho, de noite essa mesma bandeira deve ser substituída por uma faixa preta num dos faróis máximo do lado esquerdo. O condutor não deve fumar nem permitir que outros fumem. <break time=\"1s\"/> Não deve fazer travagens bruscas nem guinadas com a direção. Se for de caixa aberta não deve andar mais de 30 km/h, e se for de caixa fechada não deve andar a mais de 40 km/h. O condutor não deve parar junto das escolas, creches, hospitais, também, não deve parar nas bombas de combustíveis, bocas-de-incêndio, casa de espetáculos, nas fábricas quando está em funcionamento, e outros estabelecimentos semelhante quando sinalizado, e deve possuir outras autorizações para transitar de noite. <break time=\"5s\"/>`;
//
// // const options = {
// //     method: 'POST',
// //     url: 'https://cxl-services.appspot.com/proxy?url=https://texttospeech.googleapis.com/v1beta1/text:synthesize&token=03AFY_a8WrDtg316UxN4YWvkSYINxTVxo8S0r9iTgD_sB_BuCPOKz8JYuVKhgBefYPAak8wzS4FTIKj2uZNSMjHHX4IscqQ1mdqb-AZxB3lbfqKYxeQny1wC4O7gTfMsJ3AwQJiY0EvrhS_YHuCrxvkOwrXlGbMwscwbj8MEQ1lxTjGwvnMLdCx7Cp69BIXbn1wWtXAh1ZV1haN',
// //     data: {
// //         "audioConfig": {
// //             "audioEncoding": "LINEAR16",
// //             "effectsProfileId": [
// //                 "wearable-class-device"
// //             ],
// //             "pitch": 0,
// //             "speakingRate": 1
// //         },
// //         "input": {
// //             "ssml": "<speak> <break time=\"1s\"/> Em que caso um veículo está autorizado a transportar explosivos? <break time=\"15s\"/> Para transportar explosivos, deve pedir duas autorizações, uma da PSP e outra da direção de transporte e portos. Deve possuir dois extintores de incêndio em bom estado de funcionamento. Deve ainda possuir uma bandeira preta que deve ser colocado na parte superior de tejadilho, de noite essa mesma bandeira deve ser substituída por uma faixa preta num dos faróis máximo do lado esquerdo. O condutor não deve fumar nem permitir que outros fumem. <break time=\"1s\"/> Não deve fazer travagens bruscas nem guinadas com a direção. Se for de caixa aberta não deve andar mais de 30 km/h, e se for de caixa fechada não deve andar a mais de 40 km/h. O condutor não deve parar junto das escolas, creches, hospitais, também, não deve parar nas bombas de combustíveis, bocas-de-incêndio, casa de espetáculos, nas fábricas quando está em funcionamento, e outros estabelecimentos semelhante quando sinalizado, e deve possuir outras autorizações para transitar de noite. <break time=\"5s\"/> </speak>"
// //         },
// //         "voice": {
// //             "languageCode": "pt-PT",
// //             "name": "pt-PT-Standard-B"
// //         }
// //     }
// // };
//
// //language=file-reference
// let filename = Path.join( __dirname, "texttospeech.googleapis.com/audios/152.mp3" );
//
// tts( "pt-PT", "pt-PT-Standard-B", text, filename ).then( value => {
//     // $ mplayer foo.mp3
//     player.play(filename, function(err){
//         if (err) throw err
//     })
//     console.log( value );
// });
//
//
// //
// // axios.request(options).then(function (response) {
// //
// //     console.log( response.status )
// //
// //     const fs = require('fs')
// //
// //     const wavUrl = "data:audio/wav;base64," + response.data.audioContent
// //     const buffer = Buffer.from(
// //         response.data.audioContent,  // only use encoded data after "base64,"
// //         'base64'
// //     )
// //     fs.writeFileSync('./audio-73739.wav', buffer)
// //     console.log(`wrote ${buffer.byteLength.toLocaleString()} bytes to file.`)
// //     // console.log( response.data.audioContent );
// // }).catch(function (error) {
// //     console.error(error);
// // });


import {converter} from "./converter";
import {converterConfigs} from "./load";
import * as Path from "path";



let _sources = [ ...converterConfigs.sources ];

// console.log( _sources )

let next = ()=>{
    let _next = _sources.shift();
    if( !_next ) return;
    // language=file-reference
    converter( _next, Path.join( __dirname, "./audios" ) ).then( () => {
        next();
    });
}
next();