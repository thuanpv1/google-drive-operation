const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');
const { google } = require('googleapis');
const { authorize, uploadFile, moveFile, move } = require('.');
const multer  = require('multer');

app.use(bodyParser.urlencoded({ limit: '50000mb', extended: true }));
// app.use(bodyParser.json({limit: '50000mb'}));

// const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar'];
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'tokenweb2.json';

// var proxy = require('http-proxy').createProxyServer({
//     host: 'www.googleapis.com',
//     // port: 80
// });


// const upload = multer({ storage: storage })
let formidable = require("formidable");
const { Stream } = require('stream');

//Specify the port number and other globals!
var port = process.env.PORT || 3501;
var oAuth2Client, token, credentials;

//Endpoint to begin the authorization process
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


app.post("/api/uploadFiles", (req, res) => {

    let { id } = req.query
    console.log('id===', id)
    let content = fs.readFileSync('credentialweb2.json')
    authorize(JSON.parse(content), (auth) => move(auth, id, res));

    // proxy.web(req, res, {
    //     forward: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media'
    // }, next);

    // console.log('safdsdf===\n\n\n', req)
    // console.log('===================\n\n\n\n')
    // res.send(true)
    // fs.readFile('credentialweb2.json', (err, content) => {
    //     if (err) return console.log('Error loading client secret file:', err);
    //     // Authorize a client with credentials, then call the Google Drive API.
    //     // authorize(JSON.parse(content), (auth) => uploadFile(auth, data));
    //   });
    // let content = fs.readFileSync('credentialweb2.json')
    // if (content) {
    //     let form = new formidable.IncomingForm();
    //     form.uploadDir = "uploads/"
    //     form.on('data', (data) => {
    //         console.log('data===', data)
    //     })
        
    //     form.on('file', (data, file) => {
    //         // console.log('data===', data)
    //         console.log('file===', file)
    //     })
    //     form.on('error', (err) => {
    //         console.log('err===', err)
    //     })

    //     form.on('progress', (byteReceived, byteExpected) => {
    //         if (byteExpected === byteReceived) {
    //             console.log('finished ====', Date.now())
    //             // res.send(true)
    //         }
    //     })
    //   // Xử lý upload file với hàm .parse
    //   form.parse(req, (err, fields, files) => {
    //     if (err) throw err;
    //     // Lấy ra đường dẫn tạm của tệp tin trên server
    //     let tmpPath = files;
    //     // Khởi tạo đường dẫn mới, mục đích để lưu file vào thư mục uploads của chúng ta
    //     // let newPath = form.uploadDir + files.file.name;
    //     // console.log('tmpPath===', tmpPath.image)
    //     // console.log('tmpPath===', tmpPath.image['path'])

    //     // Stream.Readable.from()
    //     var readerStream = fs.createReadStream(tmpPath.image.filepath)
    //     let fileName = tmpPath.image.originalFilename
    //     // var writeStream = fs.createWriteStream('test.txt')
        
    //     // readerStream.pipe(tmpPath.image['_writeStream']);
    //     // let writeStream = tmpPath.image['_writeStream']
    //     // writeStream.on("finish", () => {
    //         // writeStream.pipe(readerStream)
    //         authorize(JSON.parse(content), (auth) => uploadFile(auth, readerStream, fileName, res));
    //     // })


    //     // Đổi tên của file tạm thành tên mới và lưu lại
    //     // fs.rename(tmpPath, newPath, (err) => {
    //     //   if (err) throw err;
          
    //     //   switch (files.file.type) {
    //     //     // Kiểm tra nếu như là file ảnh thì render ảnh và hiển thị lên.
    //     //     case "image/jpeg":
    //     //       fs.readFile(newPath, (err, fileUploaded) => {
    //     //         res.writeHead(200,{"Content-type":"image/jpeg"});
    //     //         res.end(fileUploaded);
    //     //       });
    //     //       break;
    //     //     // Còn lại các loại file khác thì chỉ hiển thị nội dung thông báo upload thành công.
    //     //     default:
    //     //       res.writeHead(200, {"Content-Type": "text/html"});
    //     //       res.end(`Upload file <strong>${files.file.name}</strong> successfuly`);
    //     //       break;
    //     //   }
    //     // });
    //   });
    //     // authorize(JSON.parse(content), (auth) => uploadFile(auth, readerStream));
    // }

    // res.send(true)
});

// app.post('/uploadphoto', upload.single('picture'), (req, res) => {
//     var img = fs.readFileSync(req.file.path);
//     res.send(true)
// })

app.listen(port, () => {
    //Read the credentials file.
    fs.readFile("credentialweb2.json", (err, content) => { //Credentials file is named the same 
        if (err) {
            console.log("Error occurred", err);
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