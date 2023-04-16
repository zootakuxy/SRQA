import {Player} from "../player";
import {loadQuestionPlayList} from "../player/playlist/all-question";
import Path from "path";

let player = new Player({
    //language=file-reference
    dirname: Path.join( __dirname, "../../dist/player")
});
loadQuestionPlayList( {
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
