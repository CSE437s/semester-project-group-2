const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")
const passport = require("passport")
const mongoose = require("mongoose")
const session = require("express-session")
const handlebars = require("express-handlebars")
const Strategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const JWTstrategy = require("passport-jwt").Strategy
const JWTextract = require("passport-jwt").ExtractJwt 
const userModel = require("./database/models/userModel")
const JWT = require("jsonwebtoken")

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
// app.engine("handlebars", handlebars())
// app.set("view engine", "handlebars")
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true
}))
// app.use(express.urlencoded({extended: false}))

// setup passport
app.use(passport.initialize()) // setup
app.use(passport.session()) // keep local sessions
const strategy = new Strategy(userModel.authenticate())
passport.use(strategy);
// passport.serializeUser(userModel.serializeUser());
// passport.deserializeUser(userModel.deserializeUser());
passport.serializeUser((err, user, next) => { // take the user info that is currently in JSON form and encrypt user information in the form of JWT
    console.log("HUH", user)
    next(null, user._id) 
})
passport.deserializeUser((id, next) => { // go from encrypted data and return the user JSON object
    userModel.findById(id).then((user) => { // look in the collection for a user with the given id
        console.log("USER", user)
        return next(null, user)
    }).catch(e => next(e, null))
})

passport.use(new JWTstrategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: JWTextract.fromAuthHeaderAsBearerToken()
    },
    (token, next) => {
        try {
            console.log("found token", token)
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
            console.log("no user with this email found in the database")
            return next(null, null,{ message: "this email does not have as associated account" })
        }
        user.comparePassword(password).then((res) => {
            if(res === false) {
                return next(null, null, { message: "incorrect password" })
            }
            return next(null, user, null)
        }).catch( e => next(e, null, null))
        // bcrypt.compare(password, user.password, (err, res) => {
        //     if(err) {
        //         console.log(err)
        //         return next(err)
        //     }
        //     if(res === false) {
        //         return next(null, {message: "incorrect password"})
        //     }
        //     return next(null, user)

        // })
        //  return next(null, user, null)
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
        // if(!email || !password || !firstName || !lastName) {
        //     return callback({
        //         "error": "missing one of email, password, first, or last"
        //     }, null)
        // }
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
                console.log(user, error)
                if(error) {
                    return next(error)
                }
                const token = JWT.sign( { userId: user._id, "email": user.email, "firstName": user.firstName, "lastName": user.lastName, "role": user.role, "status": user.status }, process.env.JWT_SECRET, {expiresIn: "48h"})
                return res.json({ token })
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
      res.json({ message: 'You made it to the secured profie' })
    } else {
      res.json({ message: 'You are not authenticated' })
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