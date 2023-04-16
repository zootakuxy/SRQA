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
        // "theoretic",
    ]
}).then(soundList => {
    player.addPlayList( "loadAllQuestionPlaylist", soundList );
    player.play({
        replay: false,
        replayAll: true,
        random: true
    })
} );
