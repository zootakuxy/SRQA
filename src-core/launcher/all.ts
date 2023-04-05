require("source-map-support").install();

import {convert} from "../convert";

convert({
    convertAnswer: true,
    convertQuestion: true,
    convert: true,
    "convertQ+A": true
}).then(value => {
    console.log( "Answer finalized!" );
});
