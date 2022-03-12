const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');
const { google } = require('googleapis');
const { authorize, getTempToken, renameAndMoveFile } = require('./googleDriveApi');
const { TOKEN_PATH, SCOPES, CREDENTIAL_PATH } = require('./constant');

// setup common
app.use(bodyParser.urlencoded({ limit: '50000mb', extended: true }));
app.use(bodyParser.json({limit: '50000mb'}));
//Specify the port number and other globals!
var port = process.env.PORT || 3501;
var oAuth2Client, token, credentials;

//Home endpoint
app.get("/home", (req, res) => {
    let token = fs.readFileSync(TOKEN_PATH).toString()
    res.send('Get token successfully: <br><br>' + token)
});

//Endpoint to begin the authorization process
app.get("/api/authorize", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', //Important for service to service calls.
        scope: SCOPES, //Previously defined as a global
    });
    res.send(authUrl);
});

//Simple endpoint that consumes the code, creates the TOKEN File and redirects to Home.
app.get("/auth", (req, res) => {
    if (req.query) {
        //Could be extra step
        if (req.query.code) {
            oAuth2Client.getToken(req.query.code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                console.log('token======', token)
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                console.log("Creating Token File");
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) {
                        console.error(err);
                        res.redirect("/home?error=true&message=" + encodeURI("Unable to read token"));
                    }
                    else {
                        res.redirect("/home?error=false");
                    }
                });
            });
        }
        else
            res.redirect("/home?error=true&message=" + encodeURI("Code not available"));
    }
    else
        res.redirect("/home?error=true&message=" + encodeURI("Query param not set in request"));
});


app.get('/api/getTempToken', (req, res) => {
    let content = fs.readFileSync(CREDENTIAL_PATH)
    if (content) authorize(JSON.parse(content), (auth) => getTempToken(auth, res));
    else res.send(null)
})


app.post("/api/renameAndMoveFile", (req, res) => {
    let { fileId,  targetFolderId } = req.query
    console.log('id===', fileId)
    let content = fs.readFileSync(CREDENTIAL_PATH)
    if (!targetFolderId) targetFolderId = "0B6AfxUYuFcCLZnpudExsRjQ3eWs";
    if (content) authorize(JSON.parse(content), (auth) => renameAndMoveFile(auth, fileId, targetFolderId, res));
    else res.send(false)
});


app.listen(port, () => {
    //Read the credentials file.
    fs.readFile(CREDENTIAL_PATH, (err, content) => { //Credentials file is named the same 
        if (err) {
            console.log("Error occurred when reading CREDENTIAL_PATH ", err);
        }
        else {
            //If success, then store the credentials inside variable for reuse and configure the OAuth2 Client
            content = JSON.parse(content.toString());
            credentials = content.web;
            oAuth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris[0]);
            console.log("Credentials read, OAuth2Client Created \nStarted Listening on " + port);
        }
    });
});