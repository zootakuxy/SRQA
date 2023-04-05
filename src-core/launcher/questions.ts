require("source-map-support").install();
import {convert} from "../convert";

convert({ convertQuestion: true }).then(value => {
    console.log( "Question finalized!" );
});
