import {Player} from "../player";
import {loadQuestion} from "../player/playlist/all-question";
import Path from "path";

let player = new Player({
    //language=file-reference
    dirname: Path.join( __dirname, "../../dist/player")
});
loadQuestion( {
    sourceName: [
        "mechanics",
        "theoretic",
    ]
}).then(soundList => {
    console.log( soundList.map( value => value.question).join("\n"));
    player.addPlayList( "loadAllQuestionPlaylist", soundList );
    console.log( "adaadad")
    player.play({
        replay: false,
        replayAll: true,
        random: true,
        theme: true,
        //language=file-reference
        themeFile: Path.join( __dirname, "../../source/assets/themes/Ivan-Torrent-Icarus-_feat.-Julie-Elven_.mp3" ),
        themeVolume: 7,
        themeVolumeScale: 100
    }).then( value => {

    })
});

