import express from "express";
import http from "http";
import Path from "path";
import {HttpStatusCode} from "axios";
import JSON5 from "json5"
import fs from "fs";

const app = express();
let server = http.createServer({},  app );

//language=file-reference
app.use( express.static(Path.join(__dirname, "../../client/public" ) ) );


app.get("/api/v1/question/list", (req, res) => {
    let token = req.header("Token" );
    console.log("New Request");

    if( token !== "1234") {
        res.status( HttpStatusCode.Forbidden );
        console.log("Reject!")
        return res.json({
            result: false,
            message: "Access dined",
            hint: "Invalid token"
        });
    }

    //language=file-reference
    let raw = fs.readFileSync( Path.join(__dirname, "../client/public/json/questions.json5" )).toString("utf-8")
    let document = JSON5.parse( raw );

    console.log( "Ok!" );
    res.json({
        result: true,
        message:"Success",
        document
    });
    return;
});

server.listen(33998 );
