const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")
const passport = require("passport")
const mongoose = require("mongoose")
const session = require("express-session")
const handlebars = require("express-handlebars")
const crypto = require("crypto")
const Strategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const JWTstrategy = require("passport-jwt").Strategy
const JWTextract = require("passport-jwt").ExtractJwt 
const userModel = require("./database/models/userModel")
const JWT = require("jsonwebtoken")
const sendEmail = require("./sendEmail")

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
const url = DEBUGGING ? "http://localhost:3000" : "https://main--437ohproject.netlify.app" // where the request is coming from (frontend)
app.use(function(req, res, next) { // https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", url); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.json());

// mongo stuff: https://www.youtube.com/watch?v=W5Tb1MIeg-I

// connect to mongo database
mongoose.connect(process.env.ATLAS_URI)

// setup middleware 
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true
}))

// setup passport
app.use(passport.initialize()) // setup
app.use(passport.session()) // keep local sessions
const strategy = new Strategy(userModel.authenticate())
passport.use(strategy);
passport.serializeUser((err, user, next) => { // take the user info that is currently in JSON form and encrypt user information in the form of JWT
    if(err)  {
        console.log(err)
        next(err, null)
    }
    next(null, user._id) 
})
passport.deserializeUser((id, next) => { // go from encrypted data and return the user JSON object
    userModel.findById(id).then((user) => { // look in the collection for a user with the given id
        return next(null, user)
    }).catch(e => next(e, null))
})
passport.use(new JWTstrategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: JWTextract.fromAuthHeaderAsBearerToken()
    },
    (token, next) => {
        try {
            return next(null, token)
        }
        catch (e) {
            console.log(e)
        }
    }
))

passport.use("login", new Strategy({
    usernameField: "email",
    passwordField: "password", 
    passReqToCallback: true
    },
    (req, email, password, next) => { // create a strategy for authentication, setup what we will do during auth
    console.log("taking in", email, password, next)
    userModel.findOne({email: email}).then((user) =>{
        if(!user) {
            return next(null, null,{ message: "this email does not have as associated account" })
        }
        user.comparePassword(password).then((res) => {
            if(res === false) {
                return next(null, null, { message: "incorrect password" })
            }
            return next(null, user, null)
        }).catch( e => next(e, null, null))
    }).catch((e) => {
        next(e, null, null)
    })
})) 

passport.use("signup", new Strategy({
    usernameField: "email",
    passwordField: "password", 
    passReqToCallback: true
    },
    (req, email, password, callback) => {
        const body = req.body
        const first = body.firstName
        const last = body.lastName
        const role = body.role
        const status = body.status
        userModel.create({ "email": email, "password": password, "firstName": first, "lastName": last, "role": role, "status": status}).then((user) => {
            return callback(null, {
                "message": "success",
                "user": user
            })
        }).catch(e => {
            if(e.code === 11000) {
                console.log("we already have this user")
                callback({
                    "error": "user already exists"
                }, null)
            }
            else {
                console.log(e)
            }
        })
    }
))

passport.use("reset", new Strategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
    },
    (req, email, password, next) => {
        userModel.findOne({email: email}).then((user) => {
            if(!user) {
                return next(null, null, {message: "user does not exist"})
            }
            console.log("resetting password for user", user)
            const resetToken = crypto.randomBytes(32).toString("hex") // from https://blog.logrocket.com/implementing-secure-password-reset-node-js/#password-request-service
            const hash = bcrypt.hash(resetToken, bcrypt.genSalt(10))
            const resetLink = url + "/passwordReset?token=" + resetToken + "&user=" + user._id
            sendEmail(user.email, resetLink)
        }).catch(e => next(e, null, null))
    }
))

app.post("/api/login", (req, res, next) => {
    passport.authenticate("login", (error, user, info) => {
        console.log("!", error, user, info)
        if(error) {
            res.send({"error": error})
        }
        else if(user === null && !info) {
            res.send({"error": "no user with that email"})
        }
        else {
            req.login(user, (error) => {
                if(error) {
                    console.log(error)
                    return
                    // return next(error)
                }
                const token = JWT.sign( { userId: user._id, "email": user.email, "firstName": user.firstName, "lastName": user.lastName, "role": user.role, "status": user.status }, process.env.JWT_SECRET, {expiresIn: "48h"})
                res.json({ token })
            })
        }
    })(req, res, next)
})
 
app.post("/api/signup", (req, res) => {
    passport.authenticate("signup", (error, info) => {
        if(error !== null) {
            res.send({"error": error.error})
        }
        else {
            if(info.user) {
                res.send({
                    "message": "success!",
                    "user": info.user
                })
            }
            else {
                res.send({
                    "message": "could not locate specified user"
                })
            }
            
        }
    })(req, res)    
})

app.get('/api/profile', function(req, res) {
    console.log(req.session)
    if (req.isAuthenticated()) {
      res.json({ message: "success", "user": req.user})
    } else {
        // res.status(501)
        res.json({ message: 'Access denied' })
    }
  })

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