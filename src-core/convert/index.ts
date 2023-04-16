require("source-map-support").install();
import { conversionCore, ConvertOptions } from "./core";
import {AUDIO_FOLDER, converterConfigs, RAW_FOLDER} from "../load";
import * as Path from "path";



export function convert(opts:ConvertOptions ){
    let _sources = [ ...converterConfigs.sources ];

    let next = ()=>{
        let _next = _sources.shift();
        if( !_next ) return;
        // language=file-reference
        return conversionCore( _next, AUDIO_FOLDER,  RAW_FOLDER, opts ).then( () => {
            return next();
        });
    }
    return next();
}
