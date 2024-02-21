const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")

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

app.use(function(req, res, next) { // https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.json());
// serving front end build files
// app.post("/api/getPhoto", (req, res, next)=> {
//     console.log(req.body)
//     const pictureName = req.body.photoURL
//     if(pictureName) {
//         console.log("sending ", __dirname, "uploadedFiles/", pictureName)
//         return res.sendFile(path.join(__dirname.replace("backend", "/") + pictureName))
//     }
//     else {
//         console.log("error! no url")
//         res.sendStatus(500);
//         return;
//     }
    
// })
app.use('/uploadedFiles', express.static(path.join(__dirname, '/uploadedFiles')))




// route for file upload
app.post("/api/fileUpload", upload.single('myFile'), (req, res, next) => {
    console.log(req.file.originalname + " file successfully uploaded !!");
    res.sendStatus(200);
});

app.listen(3001, () => console.log("Listening on port 3001"));