require("source-map-support").install();

import {convert} from "../convert";

convert({ convertAnswer: true }).then(value => {
    console.log( "Answer finalized!" );
});
