require("source-map-support").install();

import {play} from "../play";

play({ convertAnswer: true }).then( value => {
    console.log( "Answer finalized!" );
});
