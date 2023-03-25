require("source-map-support").install();
import {play} from "./play";

play({ convert: true }).then( value => {
    console.log( "Q&A finalized!" );
});
