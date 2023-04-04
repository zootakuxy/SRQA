require("source-map-support").install();
import { conversionCore, ConvertOptions } from "./core";
import { converterConfigs } from "../load";
import * as Path from "path";

export function convert(opts:ConvertOptions ){
    let _sources = [ ...converterConfigs.sources ];

    let next = ()=>{
        let _next = _sources.shift();
        if( !_next ) return;
        // language=file-reference
        return conversionCore( _next, Path.join( __dirname, "../../dist/audios" ),  Path.join( __dirname, "../../dist/audios-raw" ), opts ).then( () => {
            return next();
        });
    }
    return next();
}
