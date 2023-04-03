const play = require('audio-play');

const load = require('audio-loader');
const Path = require("path");
//language=file-reference
load(Path.join(__dirname, "../source/001.mp3")).then( (audioBuffer)=>{

    console.log( { audioBuffer })
    let ss = setInterval( ()=>{
        console.log( pause?.currentTime )
    },1000)


    //play audio buffer with possible options
    let pause = play( audioBuffer, {
        //start/end time, can be negative to measure from the end
        // start: 0,
        // end: audioBuffer.duration,

        //repeat playback within start/end
        // loop: true,

        //playback rate
        rate: 1,

        //fine-tune of playback rate, in cents
        detune: 0,

        //volume
        volume: 1,

        //device (for use with NodeJS, optional)
        // device: 'hw:1,0',

        //possibly existing audio-context, not necessary
        context: require('audio-context')(),

        //start playing immediately
        autoplay: true
    }, ( ddd)=>{

        console.log( { ddd })
        clearInterval( ss );
    });



    console.log( pause.currentTime );
    pause.play()

    // //pause/continue playback
    // play = pause();
    // pause = play();
    //
    // //or usual way
    // let playback = play(buffer, opts?, cb?);
    // playback.pause();
    // playback.play();
    //
    // //get played time
    // playback.currentTime;
}).catch( ( err )=>{
    console.error( err)
})
