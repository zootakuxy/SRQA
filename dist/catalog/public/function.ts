import args from "./args/getClientById.args.json";
import functions from "./args/getClientById.args.json";

enum Enum {

}

let func = require("./args/getClientById.args.json");


let s = 394_404;





const Types = {
    "number":null as number,
    "string": null as string,
    "boolean": null as boolean
}

export type Func = {
    // [ f in keyof typeof functions ]?:{
    //     args: {
    //         [k in keyof typeof functions[f]["args"] ]?:typeof Types[ functions[f]["args"][k] ]
    //     }
    // }

}


const fun = args as Func;







// export type  Function  = {
//     [ f in keyof typeof fun ]?:<T = typeof fun[f]["args"], R = { [k in keyof T]: typeof Types[T[k]]}>( args:R)=>Promise<boolean>
// };


let funct:Function;

