import Path from "path";
import {decompose} from "../util/decompose";
import fs from "fs";
//language=file-reference
let breakTimes = Path.join(__dirname, "../../source/assets/silent" );
let maps = fs.readdirSync( breakTimes ).map(filename => {
    let [ name, sTime, final ] = filename.split("-");
    let [ unit, extension ] = (final||"").split(".");
    let time = Number( sTime );
    if( !time || Number.isNaN( time ) || !Number.isFinite( time ) ) time = null;

    return {
        name: filename,
        time: time,
        unit,
        extension,
        filename: Path.join(breakTimes, filename)

    };
}).filter( value => {
    return !!value.time
        && !!value.name
        && !!value.unit
        && !!value.extension
        && !!value.filename
});


let _pieces = {};
maps.forEach( value => {
    _pieces[ value.time ] = value.filename
})


const breakTime = {
    times:maps.map( value => value.time ).sort( (a, b) => {
        if( a > b ) return 1;
        else if( b > a ) return  -1;
        else return 0
    }).reverse(),
    pieces: _pieces
}

export function breakTimeAudios(time:number ):string[]{
    return  decompose(time, breakTime.times).map(value => {
        return breakTime.pieces[value];
    });
}

console.log( breakTimeAudios(13.4));


export function timePause( charLength:number){
    let times =  4+( ( charLength * 75 / 1000 )/ 3 );
    return Math.ceil( times );
}
