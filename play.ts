require("source-map-support").install();
import { converter, ConvertOptions } from "./converter";
import { converterConfigs } from "./load";
import * as Path from "path";

export function play( opts:ConvertOptions ){
    let _sources = [ ...converterConfigs.sources ];

    let next = ()=>{
        let _next = _sources.shift();
        if( !_next ) return;
        // language=file-reference
        return converter( _next, Path.join( __dirname, "./audios" ),  Path.join( __dirname, "./audios-raw" ), opts ).then( () => {
            return next();
        });
    }
    return next();
}
