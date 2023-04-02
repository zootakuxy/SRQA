// const play = require('audio-play');
// const load = require('audio-loader');
// const fs = require("fs");
//
// let fileName =  'C:\\var\\workspace\\perguntas-resposta\\audios\\Q&A\\Q&A - theoretic\\Q&A - 001 - O que sao veiculos.mp3';
// let audioBuffer = fs.readFileSync( fileName );
//
// load( fileName, {}).then( ( audioBuffer )=>{
//
//     console.log( audioBuffer )
//     let pause = play(audioBuffer, {
//         //start/end time, can be negative to measure from the end
//         start: 1,
//         end: audioBuffer.duration+3,
//
//         //repeat playback within start/end
//         loop: false,
//
//         //playback rate
//         rate: 1,
//
//         //fine-tune of playback rate, in cents
//         detune: 0,
//
//         //volume
//         volume: 1,
//
//         //device (for use with NodeJS, optional)
//         device: 'hw:1,0',
//
//         //possibly existing audio-context, not necessary
//         context: require('audio-context'),
//
//         //start playing immediately
//         autoplay: true
//     }, ()=>{
//
//     });
// });



const sound = require("sound-play");
const path = require("path");
//language=file-reference
const filePath = path.join(__dirname, "../audios/001.mp3");
sound.play(filePath, 0.1)
