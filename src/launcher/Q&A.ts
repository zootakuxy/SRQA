require("source-map-support").install();
import {convert} from "../convert";

convert({ convert: true }).then(value => {
    console.log( "Q&A finalized!" );
});
