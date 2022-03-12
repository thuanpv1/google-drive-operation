/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START drive_quickstart]
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const req = require('express/lib/request');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './tokenweb2.json';

// Load client secrets from a local file.
// fs.readFile('credentialweb2.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Drive API.
//   authorize(JSON.parse(content), uploadFile);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    // return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function move(auth, file_id, res) {
  console.log('auth===', auth)
  var target_folder = "0B6AfxUYuFcCLZnpudExsRjQ3eWs";
   var drive = google.drive('v3');
   drive.files.get({
       auth: auth,
       fileId: file_id,
       fields: 'parents'
   }, function(err, file) {
       if (err){
         console.log("ERROR while fetching parent");
         res.send(false)
       } else {
       // Move the file to the new folder
       console.log('file===', file)
       var previous_parents = file.data.parents.join(',');
       drive.files.update({
           auth: auth,
           fileId: file_id,
           addParents: target_folder,
           removeParents: previous_parents,
           fields: 'id, parents'
       }, function(err, file){
         if (err){
           console.log("ERROR while updating parent");
          res.send(false)

         } else {
           
           console.log("Success");
          res.send(true)

         }
       });
     }
   });
}




function moveFile(auth, id, res) {
  const drive = google.drive({version: 'v3', auth});
  const fileMetadata = {
    'name': 'samplehihi2.png',
    addParents: ['0B6AfxUYuFcCLZnpudExsRjQ3eWs']
  };
  // const media = {
  //   mimeType: 'application/octet-stream',
  //   // body: data
  //   body: fs.createReadStream('uploads/WinWebcam-2.6.8.exe')
  // };
  drive.files.update({
    resource: fileMetadata,
    // media: media,
    fileId: id,
    // requestBody: req.body
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
      res.send(false)
    } else {
      console.log('File Id: ', file, file.id);
      console.log('finished 2====', Date.now())
      res.send(true)
    }
  });
}

function uploadFile(auth, data, fileName, res) {
  const drive = google.drive({version: 'v3', auth});
  const fileMetadata = {
    'name': fileName || 'sample.png',
    parents: ['0B6AfxUYuFcCLZnpudExsRjQ3eWs']
  };
  const media = {
    mimeType: 'application/octet-stream',
    // body: data
    body: fs.createReadStream('uploads/WinWebcam-2.6.8.exe')
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
    // requestBody: req.body
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
      res.send(false)
    } else {
      console.log('File Id: ', file, file.id);
      console.log('finished 2====', Date.now())
      res.send(true)
    }
  });
}
/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}
// [END drive_quickstart]

module.exports = {
  SCOPES,
  listFiles,
  uploadFile,
  authorize,
  moveFile,
  move
};
