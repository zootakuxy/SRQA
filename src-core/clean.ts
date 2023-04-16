import {loadQuestion} from "./player/playlist/all-question";

import readdir from "recursive-readdir";
import {AUDIO_FOLDER, RAW_FOLDER} from "./load";
import fs from "fs";

export function clean():Promise<boolean>{
    return new Promise( resolve => {
        let locations = [];
        loadQuestion({} ).then( questions => {
            return new Promise( resolve => {
                questions.forEach( value => {
                    locations.push( ... [
                        value.fdir.audioFileOf( value, "Q+A" ),
                        value.fdir.audioFileOf( value, "Question" ),
                        value.fdir.audioFileOf( value, "Answer" ),
                        value.fdir.audioFileOf( value, "Important" ),

                        value.fdir.rawFileOf( value, "Q+A" ),
                        value.fdir.rawFileOf( value, "Question" ),
                        value.fdir.rawFileOf( value, "Answer" ),
                        value.fdir.rawFileOf( value, "Important" ),
                    ])
                })
                resolve( locations )
            })
        }).then( (value) => {
            [ AUDIO_FOLDER, RAW_FOLDER ].forEach( (sourceBase, index, array ) => {
                readdir( sourceBase,( error, files )=>{
                    let toDeltes = files.filter( value => {
                        return !locations.includes( value );
                    });

                    toDeltes.forEach( deleteFile => {
                        fs.unlinkSync( deleteFile );
                        console.log( `Delete file ${ deleteFile }... ok!` );
                    });

                    if( index+1 === array.length ) return resolve( true )
                })
            })
        })
    })
}

if( require.main.filename === __filename ){
    clean().then(  value => {})
}
