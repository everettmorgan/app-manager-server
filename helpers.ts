import * as e from 'express';

export function start(app : e.Application, p : number = 8080, i? : number) {
    const port = ( i ? p+i : p );
    try {
        app.listen(port, function() : void {
            console.log(`listening on portt ${ port }`);
        })
    } catch (e) {
        start(app, port, (i ? i : 1));
    }
}

export function toss(
    check : boolean,
    msg : string,
    before : () => void,
) : void {
    if (check) {
        before();
        throw msg; 
    }
}