const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")

// setup multer for file upload
var store = multer.diskStorage(
    {
        destination: './uploadedFiles',
        filename: function (req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

const upload = multer({ store: store } )
const DEBUGGING = true
const url = DEBUGGING ? "http://localhost:3000" : "https://carefully-certain-swift.ngrok-free.app"
app.use(function(req, res, next) { // https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", url); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.json());
// serve profile pictures statically 
app.use('/uploadedFiles', express.static(path.join(__dirname, '/uploadedFiles')))

const URLs = new Map()

app.post("/api/sendVideoURL", (req, res) => {
    console.log(req.body)
    const callCreatedBy = req.body.creator
    const url = req.body.url
    URLs.set(callCreatedBy, url)
    console.log(URLs)
    res.sendStatus(201)
})

app.post("/api/getVideoURL", (req, res) => {
    const user = req.body.creator
    if(URLs.has(user) == true) {
        console.log("returning the URL")
        res.json({"url": URLs.get(user)})
    }
    else {
        res.json({"error": "couldn't find a URL associated with user:"+user})
    }
})

app.post("/api/updateOHTime", (req, res)=> {
    // TODO after MVP, move API requests to database to the backend
    // const user = req.body.user
    // const days = req.body.days
    // const start = req.body.start
    // const end = req.body.end
    // console.log(user)
    // const userRef = doc(db, "users", user);
    // if(!userRef) {
    //     res.json({"error": "cannot find user document with that user ID"})
    //     res.sendStatus(404)
    // }
    // setDoc(userRef, {
    //     OHtimes: {
    //         days: days,
    //         start: start,
    //         end: end
    //     }
    // }, { merge: true }).then(()=>{
    //     res.sendStatus(201)
    // }).catch((e) => {
    //     res.json({"systemerror": e})
    //     res.sendStatus(400)
    // })
})



// route for file upload
app.post("/api/fileUpload", upload.single('myFile'), (req, res, next) => {
    console.log(req.file.originalname + " file successfully uploaded !!");
    res.sendStatus(200);
});

const port = process.env.PORT || 3001
app.listen(port, () => console.log("Listening on port " + port));