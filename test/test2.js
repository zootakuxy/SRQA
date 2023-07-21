const {audioJoin} = require("../src-core/util/file-join");
const Path = require("path");
const fs = require("fs");
audioJoin( {
    //language=file-reference
    files:[
        Path.join( __dirname, "../source/break-times/silent-0.1-s.mp3" ),
        Path.join( __dirname, "../source/break-times/silent-5.0-s.mp3" ),
        Path.join( __dirname, "../source/break-times/silent-5.0-s.mp3" ),
        Path.join( __dirname, "../source/break-times/silent-5.0-s.mp3" ),
        Path.join( __dirname, "../source/break-times/silent-5.0-s.mp3" )
    ],
    concatFile: Path.join( __dirname, "file.mp3")
}).then( value => {
    console.log( value );

    //language=file-reference
    console.log(fs.readFileSync(Path.join(__dirname, "../source/break-times/silent-1.0-s.mp3")).toString())
    //language=file-reference
    console.log(fs.readFileSync(Path.join(__dirname, "../source/assets/silent/breakTime-1-s.mp3")).toString())
});


