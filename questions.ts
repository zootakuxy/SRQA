require("source-map-support").install();
import {play} from "./play";

play({ convertQuestion: true }).then( value => {
    console.log( "Question finalized!" );
});
