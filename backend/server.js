const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")
const http = require("http")
// const httpServer = http.createServer(app) // create HTTP server on the port

// PROFILE PICTURES
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


// VIDEO CALLING URLS
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


// USER INFORMATION
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




// open port
const port = process.env.PORT || 3001
const server = app.listen(port, () => console.log("Listening on port " + port));
const io = require("socket.io")(server, {
    cors: {
        "origin": "http://localhost:3000"
    }
}) // communicate over the httpServer


//WHITEBOARD SOCKETS
// thank you to this random guy who helped me use sockets for this purpose: https://www.youtube.com/watch?v=Br4uaXHrODg
var connections = []
const printIDs = (connections) => {
    var ids = ""
    for(var socket in connections) {
        ids += connections[socket].id + ", "
    }
    return ids
}
io.on("connect", (socket) => {
    connections.push(socket) // keep track of all connected sockets
    console.log("connected sockets:", printIDs(connections))
    console.log("Socket:", socket.id, "has connected")
    socket.on("begin-draw", (data) => {
        connections.forEach((listeningSocket)=>{
            if(listeningSocket.id !== socket.id) { // only draw the new points on the canvas' that DONT belong to original socket
                listeningSocket.emit("start-drawing", {
                    "x": data.x, 
                    "y": data.y
                })
            }
           
        })
    })
    socket.on("end-draw", (data)=>{
        connections.forEach((listeningSocket)=>{
            if(listeningSocket.id !== socket.id) {
                listeningSocket.emit("get-drawing", {
                    "x": data.x, 
                    "y": data.y
                })
            }
        })
    })
    socket.on("colorChange", (data) => {
        connections.forEach(listeningSocket => {
            if(listeningSocket.id !== socket.id) {
                listeningSocket.emit("changeMyColor", {
                    "newColor": data.newColor
                })
            }
        })
    })
    socket.on("closePath", ()=>{
        connections.forEach(listeningSocket => {
            if(listeningSocket.id !== socket.id) {
                listeningSocket.emit("closePath")
            }
        })
    })

    socket.on("disconnect", (e)=>{
        console.log("Socket", socket.id, "disconnected because", e)
        connections = connections.filter((item)=>{ 
            if(item.id !== socket.id) {
                return item;
            }
        })
        console.log("connected sockets", printIDs(connections))
    })
})