import fs from "fs";
import Path from "path";

export type FileJoinOption = {
    files:string[],
    join:string
}
export function fileJoin( opts:FileJoinOption ):Promise<Error>{

    return new Promise( resolve => {
        fs.mkdirSync( Path.dirname(opts.join), { recursive: true });
        let write = fs.createWriteStream( opts.join );
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
