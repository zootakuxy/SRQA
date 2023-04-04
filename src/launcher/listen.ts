import {Player} from "../player";
import {loadAllQuestionPlaylist} from "../player/playlist/all-question";

let player = new Player();
loadAllQuestionPlaylist().then(soundList => {
    player.addPlayList( soundList );
    player.play({
        replay: false,
        replayAll: true,
        random: true
    })
} );
