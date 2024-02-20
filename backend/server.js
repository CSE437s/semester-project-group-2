// const express = require("express")
// const multer = require("multer")
// const port = 3001
// const app = express()

// var files = multer.diskStorage({
//     destination: "./uploadedFiles"
// })

// const upload = multer({"storage": files})

// app.get("/api/", (req, res) => {
//     res.send("hello")
// })

// app.use(express.json())
// app.use(express.static(__dirname + "/../uploadedFiles")); // thank you stack overflow: https://stackoverflow.com/questions/70588644/file-upload-to-custom-folder-in-react
// // app.post("/api/fileUpload", upload.single("newFile"), (req, res) => {
// //     console.log("file uploaded")
// //     res.send(200);
// // });
// app.post("/api/fileUpload", upload.single('newFile'), (req, res, next) => {
//     // console.log(" file successfully uploaded !!");
//     // console.log(req.body)
//     // res.sendStatus(200);
//     // next();
//     if (!!req.file) {
//         res.json({
//             url: `/uploadedFiles/${req.file.filename}`,
//         });
//     } else {
//         next(new Error('No file found'));
//     }
// });
// app.listen(port, () => {
//     console.log("Backend open on port " + port)
// })
const express = require("express");
const app = express();
const multer  = require('multer')

// setup multer for file upload
var storage = multer.diskStorage(
    {
        destination: './uploadedFiles',
        filename: function (req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

const upload = multer({ storage: storage } )

app.use(express.json());
// serving front end build files
app.use(express.static(__dirname + "/../build"));

app.use(function(req, res, next) { // https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// route for file upload
app.post("/api/fileUpload", upload.single('myFile'), (req, res, next) => {
    console.log(req.file.originalname + " file successfully uploaded !!");
    res.sendStatus(200);
});

app.listen(3001, () => console.log("Listening on port 3001"));