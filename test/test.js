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


var audioconcat = require('audioconcat')
const Path = require("path");
const fs = require("fs");
const sound = require("sound-play");

//language=file-reference
var songs = [
    // Path.join( __dirname, "../source/break_time_01_second.mp3" ),
    Path.join( __dirname, "../source/ola.mp3" ),
    // Path.join( __dirname, "../source/break_time_01_second.mp3" ),
    Path.join( __dirname, "../source/ola.mp3" ),
    // Path.join( __dirname, "../source/break_time_01_second.mp3" ),
    Path.join( __dirname, "../source/ola.mp3" ),
    // Path.join( __dirname, "../source/break_time_01_second.mp3" ),
    Path.join( __dirname, "../source/ola.mp3" ),
    // Path.join( __dirname, "../source/break_time_01_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/break_time_0_1_second.mp3" ),
    // Path.join( __dirname, "../source/ola.mp3" ),
]
// var wavconcat = require('wav-concat')
//
// var ffmpeg = require('fluent-ffmpeg');
// var command = ffmpeg();
//
//
// //language=file-reference
// console.log(  process.cwd(), Path.relative( process.cwd(), Path.join( __dirname, "../source/break_time_01_second.mp3" ) ))
// console.log( ffmpeg() )
// ffmpeg()
//     .input(( Path.join( __dirname, "../source/ola.mp3" ) ))
//     .mergeToFile(( Path.join( __dirname, "../source/ola2.mp3" ) ))


//language=file-reference
// sound.play( Path.join(__dirname,   "../dist/audios/Q+A/Q&A - mechanics/QA - 003 - Para que serve carter.mp3").split("/").map( value => {
//     value = value.replace(/[ ]\g/, `" "`)
//     return value
// })).then( value => {
//     console.log( value );
// })
