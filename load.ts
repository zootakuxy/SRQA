import ini from "ini";
import * as fs from "fs";
import * as Path from "path";

//language=file-reference
let source = Path.join( __dirname, "./source" );
let filter =  new RegExp(`((^)*.${"txt"})$`);

export interface Configs  {
    translate:{
        language:string
        voice1:string
        voice2:string
    }
}

export interface Source {
    filename:string,
    name:string,
    confFile:string,
    configs?:Configs,
    lasted:string
}

const sources:Source[] = fs.readdirSync( source )
    .filter( value => filter.test( value ) )
    .map( value => {
        let filename = Path.join( source, value );
        let name = Path.basename(value, ".txt" );
        let confFile = Path.join( source, name+".conf" );
        let lasted = Path.join( source, name+ ".json5" );
        let configs:Configs = null;

        if( fs.existsSync( confFile ) )
            configs = ini.parse( fs.readFileSync( confFile ).toString()) as Configs;

        return  {
            filename,
            name,
            confFile,
            lasted,
            configs
        }
    });

export const converterConfigs  = {
    sources: sources,
    language: "pt-PT",
    voice1:"pt-PT-Standard-A",
    voice2: "pt-PT-Standard-B"
};
