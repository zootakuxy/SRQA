require("source-map-support").install();
import {convert} from "../convert";

convert({ "convertQ+A": true }).then(value => {
    console.log( "Q&A finalized!" );
});
