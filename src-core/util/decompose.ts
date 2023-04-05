export type DecomposeOptions = {
    value:number,
    choose:number[],
    decimal:number
}
export function decompose( value:number, choose:number[] ):number[]{
    let decomposed:number[] = [];
    let _next
    while (value > 0 && ( choose = choose.filter( value1 => value1 <= value)).length> 0 ){
        _next = choose[0];
        value = +((value) - (_next)).toFixed( 6 );
        decomposed.push( _next );
    }

    return decomposed;
}

if( require.main.filename === __filename ){
    console.log( decompose( 18.7, [ 5, 2, 1, 0.5, 0.1 ] ) )
}
//
