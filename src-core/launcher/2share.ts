import Path from "path";
import fs from "fs";

//language=file-reference
let shareOf = Path.join( __dirname, "../../dist/audios/shareOf" );
let toShare = Path.join( __dirname, "../../dist/audios/toShare" );

fs.mkdirSync( toShare, { recursive: true });

fs.readdirSync( shareOf ).forEach( share => {
    let shareParts = share.split(" - ");
    console.log( shareParts[shareParts.length-1] )
    fs.cpSync( Path.join( shareOf, share), Path.join( toShare, shareParts[ shareParts.length-1 ] ) );
});
