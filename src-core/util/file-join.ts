import fs from "fs";
import Path from "path";
import audioconcat from "audioconcat";
import {spawn} from "child_process";

export type FileJoinOption = {
    files:string[],
    concatFile:string
}
export function fileJoin( opts:FileJoinOption ):Promise<Error>{
    return new Promise( resolve => {
        console.log("Using fileJoin to concat audio-files")
        let write = fs.createWriteStream( opts.concatFile );
        let files = [ ... opts.files ];
        let procede = ( ) =>{
            if( !files.length ) {
                return resolve( null )
            }
            let stream = fs.createReadStream( files.shift() );
            stream.pipe(write, { end: false });
            stream.on( "close", ()=>{
                procede();
            });
        }
        procede();
    })
}

export function audioJoin(opts:FileJoinOption ):Promise<Error>{
    return new Promise( resolve => {
        fs.mkdirSync( Path.dirname( opts.concatFile), { recursive: true });
        audioconcat( opts.files )
            .concat( opts.concatFile )
            .on("start", ()=>{
                console.log("Using audioconcat to concat audio-files")
            })
            .on('error', function (err, stdout, stderr) {
                fileJoin( opts ).then( value => resolve( value ) );
            })
            .on('end', function (output) {
                resolve( null );
            })
    })
}


export function fixJoinedAudio(filename ):Promise<boolean>{
    return new Promise<boolean>(resolve => {
        //language=file-reference
        let tool = Path.join( __dirname, "../lib/mp3val/mp3val.exe" );
        let child = spawn( tool, [ `"${filename}"`, "-f", "-nb", "-si"]);
        child.on( "close", code => {
            resolve( true );
        });
    });
}
