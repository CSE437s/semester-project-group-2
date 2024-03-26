const express = require("express");
const app = express();
const multer  = require('multer')
const path = require("path")
const passport = require("passport")
const mongoose = require("mongoose")
const session = require("express-session")
const crypto = require("crypto")
const Strategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const JWTstrategy = require("passport-jwt").Strategy
const JWTextract = require("passport-jwt").ExtractJwt 
const userModel = require("./database/models/userModel")
const tokenModel = require("./database/models/tokenModel")
const classModel = require("./database/models/classModel")
const JWT = require("jsonwebtoken")
const sendEmail = require("./sendEmail")
const cors = require('cors')
// setup multer for file upload
var store = multer.diskStorage({
    destination: './uploadedFiles',
    filename: function (req, file, cb ) {
        cb( null, file.originalname);
    }
});

const upload = multer({ store: store } )
const DEBUGGING = process.env.DEBUGGING
const url = DEBUGGING ? "http://localhost:3000" : "https://main--437ohproject.netlify.app" // where the request is coming from (frontend)
app.use(cors({ credentials: true, origin: url}));
app.use(function(req, res, next) { // https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", url); 
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); 
    res.header("Access-Control-Allow-Credentials", true)
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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
    saveUninitialized: true,
    cookie: {
        sameSite: "strict"
    }
}))

// setup passport
app.use(passport.initialize()) // setup
app.use(passport.session()) // keep local sessions
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})
const strategy = new Strategy(userModel.authenticate())
passport.use(strategy);
passport.serializeUser((user, next) => { // take the user info that is currently in JSON form and encrypt user information in the form of JWT
    next(null, user._id)
})
passport.deserializeUser((id, next) => { // go from encrypted data and return the user JSON object
    userModel.findById(id).then((user) => { // look in the collection for a user with the given id
        return next(null, user)
    }).catch(e => next(e, null))
})
passport.use("jwt", new JWTstrategy({
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: JWTextract.fromAuthHeaderAsBearerToken()
    },
    (token, next) => {
        userModel.findOne({_id: token.userId}).then((user) => {
            return next(null, user)
        }).catch(error => {
            return next(error)
        })
    }
))

passport.use("login", new Strategy({
    usernameField: "email",
    passwordField: "password", 
    passReqToCallback: false
    },
    (email, password, next) => { // create a strategy for authentication, setup what we will do during auth 
    userModel.findOne({email: email}).then((user) =>{
        if(!user) {
            return next(null, null,{ message: "this email does not have as associated account" })
        }
        user.comparePassword(password)
        .then((res) => {
            console.log(res)
            if(res === undefined) {
                return next("something went wrong while comparing")
            }
            if(res === false) {
                return next("incorrect password")
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
            console.log(e)
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
    passport.authenticate("login", 
    (error, user, info) => {
        if(error) {
            res.send({"error": JSON.stringify(error)})
        }
        else if(user === null && !info) {
            res.send({"error": "no user with that email"})
        }
        else {
            req.login(user, function (error) {
                if(error) {
                    if(error === "incorrect password") {
                        res.status(401).send("incorrect password")
                    }
                    else {
                        res.status(500).send({"error": "failed to serialize user"})
                    }
                }
                else {
                    const token = JWT.sign( { userId: user._id, "email": user.email, "firstName": user.firstName, "lastName": user.lastName, "role": user.role, "status": user.status }, process.env.JWT_SECRET, {expiresIn: "48h"})
                    res.send({ token : token })
                }
            })
        }
    })(req, res, next)
})

app.post("/api/initiateReset", (req, res) => {
    const email = req.body.email
    userModel.findOne({email: email}).then((user) => {
        if(!user) {
            return next(null, null, {message: "user does not exist"})
        }
        //really readable line of code to first locate any token that is associated with the user and delete it
        tokenModel.findOne({userId: user._id}).then((oldToken) => tokenModel.deleteOne(oldToken).then((msg) => console.log(msg)).catch(e => console.log(e))).catch(e => console.log(e))
        const resetToken = crypto.randomBytes(32).toString("hex")
        bcrypt.hash(resetToken, Number(bcrypt.genSalt(10))).then((hash) => {
            tokenModel.create({
                userId: user._id,
                token: hash,
                createdAt: Date.now()
            }).then((createdToken) => {
                const resetLink = url + "/passwordReset?token=" + resetToken + "&user=" + user._id
                sendEmail(user.email, resetLink)
            }).catch(e => {
                res.status(418).send({"error": e})
            }) // from https://blog.logrocket.com/implementing-secure-password-reset-node-js/#password-request-service
        }).catch(e => {
            res.status(418).send({"message": "there was an error hashing the token", "error": e})
        })
            
    }).catch(e => { 
        res.status(418).send({"error": e})
    })
})

app.post("/api/resetPassword", (req, res) => {
    tokenModel.findOne({userId: req.body.id}).then((tokenObject) =>{
        if(!tokenObject) {
            res.status(418).send({"message": "no token was found registered for this user"})
        }
        else {
            const token = tokenObject.token
            bcrypt.compare(req.body.token, token).then((validity) => {
                if(validity === true) {
                    bcrypt.hash(req.body.newPassword, Number(bcrypt.genSalt(10))).then((hashedPassword) => {
                        userModel.updateOne({_id: req.body.id}, {
                            $set: {
                                password: hashedPassword
                            }
                        },
                        {new: true}
                        ).then(msg => {
                            if(msg.modifiedCount === 1) {
                                res.status(201).send({message: "password successfully modified"})
                            }
                            else {
                                res.status(500).send({message: "we were unable to modify password"})
                            }
                        })
                    }).catch(e => console.log(e))
                    tokenModel.deleteOne({userId: req.body.id}).then((result) => {
                        if(result) {
                            return true
                        }
                    }).catch(e => e)
                    
                }
                else {
                    res.status(401).send({"message": "invalid token you suck"})
                }
            })
        }
    })
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
                    "message": info
                })
            }
            
        }
    })(req, res)    
})

app.get('/api/profile', (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            res.send({user: user})
        }
    })(req, res)
})

app.post("/api/findUser", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(req.body.id).then(user => {
                if(user) {
                    res.status(200).send({user: user})
                }
                else {
                    res.status(404).send({message: "user not found"})
                }
            }).catch(e => res.status(500).send({error: e}))
        }
    })(req, res)
})

app.post("/api/userClasses", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const userId = req.body.id
            userModel.findById(userId).then(user => {
                if(!user) {
                    res.status(404).send({error: "user not found"})
                }
                else {
                    const instructorClasses = user.classesAsInstructor
                    const TAclasses = user.classesAsTA
                    const studentClasses = user.classesAsStudent

                    // const classes = [
                    //     ...instructorClasses,
                    //     ...TAclasses,
                    //     ...studentClasses
                    // ]
                    const classes = {
                        instructor: instructorClasses,
                        TA: TAclasses,
                        student: studentClasses
                    }
                    res.status(200).send({classes: classes})
                }
            }).catch(e => res.status(500).send(e))
        }
    })(req, res)
})

app.post("/api/enrollInCourse", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const userId = req.body.id
            const classCode = req.body.courseId
            const roleInCourse = req.body.newRole
            classModel.findOne({ classCode: classCode }).then(classToEnroll => {
                if(!classToEnroll) {
                    res.status(404).send({message: "couldn't find course with this code"})
                    return
                }
                const tempRole = roleInCourse.charAt(0).toUpperCase() + roleInCourse.substring(1)
                userModel.findByIdAndUpdate(userId, {
                    $push: {["classesAs" + tempRole] : classToEnroll }
                }).then((oldObject) => {
                    classToEnroll.updateOne({
                        $push: {[roleInCourse + "s"] : oldObject }
                    }).then(oldClass => {
                        res.status(201).send({message: "successfully updated"})
                    }).catch(e => res.status(500).send(e))
                }).catch(e => res.status(500).send(e))
            }).catch(e => res.status(500).send(e))
        }
    })(req, res)
})

app.post("/api/createClass", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const body = req.body
            classModel.create({
                className: body.className,
                classDescription: body.classDescription,
                classCode: body.classCode,
                createdBy: body.createdBy,
                instructorId: body.instructorId,
            }).then((createdCourse) => {
                if(createdCourse) {
                    res.status(200).send({createdClass: createdCourse})
                }
            }).catch(e => {
                console.log(e)
                if(e.code === 11000) {
                    res.status(501).send({error: "class already exists"})
                }
                else {
                    res.status(500).send({error: e})
                }
            })
        }
    })(req, res)
})

app.post("/api/getClass", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const classCode = req.body.classCode
            classModel.findOne({ classCode : classCode }).then(classObject => {
                if(classObject) {
                    res.status(200).send({class: classObject})
                }
            }).catch(e => res.status(500).send(e))
        }
    })(req, res)
})

app.post("/api/getClassById", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const classId = req.body.classId
            classModel.findById(classId).then(classObject => {
                if(classObject) {
                    res.status(200).send({class: classObject})
                }
            }).catch(e => res.status(500).send(e))
        }
    })(req, res)
})

app.post("/api/addHours", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(req.body.userId).then(user => {
                var changed = false
                if(user) {
                    const hours = user.hours
                    for(var i in hours) {
                        const hoursObject = hours[i]
                        if(hoursObject.classId === req.body.classId) {
                            hours[i].hours.push({
                                startTime: req.body.hours.startTime,
                                endTime: req.body.hours.endTime,
                                day: req.body.hours.day
                            })
                            changed = true
                            // res.status(200).send({message: "successfully pushed new time"})
                            // return
                        }
                    }
                    if(changed === false) {
                        hours.push({
                            classId: req.body.classId,
                            hours: [
                                {
                                    startTime: req.body.hours.startTime,
                                    endTime: req.body.hours.endTime,
                                    day: req.body.hours.day
                                }
                            ]
                        })
                    }
                    user.updateOne({hours: hours}).then(something => {

                        res.status(200).send({message: "created new class object"})
                    })
                }
                // res.status(500).send({error: "not"})
            })
        }
    })(req, res)
})

app.post("/api/getHours",  (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(req.body.userId).then(async user => {
                if(user) {
                res.status(200).send({hours: user.hours})
                }
                else {
                    res.status(404).send({message: "could not locate user"})
                }
            }).catch(e => res.status(500).send({error: e}))
        }
    })(req, res)
})

app.post("/api/changeRoleInClass", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(req.body.userId).then(user => {
                classModel.findById(req.body.classId).then(async course => {
                    if(user && course) {
                        const oldRole = req.body.oldRole
                        const newRole = req.body.newRole
                        var classesToSearch;
                        if(oldRole === "student") {
                            classesToSearch = user.classesAsStudent
                        }
                        else if (oldRole === "TA") {
                            classesToSearch = user.classesAsTA
                        }
                        else {
                            classesToSearch = user.classesAsInstructor
                        }
                        var classesToAdd;
                        if(newRole === "student") {
                            classesToAdd = user.classesAsStudent
                        }
                        else if (newRole === "TA") {
                            classesToAdd = user.classesAsTA
                        }
                        else {
                            classesToAdd = user.classesAsInstructor
                        }
                        const arrayWithOldRoleRemoved = classesToSearch.filter((c) => c._id.toString() !== req.body.classId)
                        classesToAdd.push(course)
                        const tempOldRole = oldRole.charAt(0).toUpperCase() + oldRole.substring(1)
                        const tempRole = newRole.charAt(0).toUpperCase() + newRole.substring(1)
                        const status = await user.updateOne({
                            ["classesAs" + tempOldRole]: arrayWithOldRoleRemoved,
                            ["classesAs" + tempRole]: classesToAdd
                        })
                        userModel.findById(req.body.userId).then(async newUser => {
                            const removedRoster = course[oldRole + "s"].filter((u) => u._id.toString() !== req.body.userId)
                            const updatedRoster = course[newRole + "s"]
                            updatedRoster.push(newUser)
                            const classStatus = await course.updateOne({
                                [oldRole + "s"]: removedRoster,
                                [newRole + "s"]: updatedRoster
                            })
                            if(classStatus && classStatus.acknowledged === true) {
                                res.status(200).send({message: "successfully updated"})
                            }
                            else {
                                res.status(500).send({message: "updating course failed"})
                            }
                        }).catch(e => res.status(500).send({error: e}))
                    }
                }).catch(e => res.status(500).send({error: e}))
            }).catch(e => res.status(500).send({error: e}))
        }
    })(req, res)
})

app.post("/api/updateUserName", (req, res) => {
    console.log("we get to server.js");
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findByIdAndUpdate(req.body.id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }).then(r => {
                if(r) {
                    res.status(201).send({message: "updated successfully"})
                }
                else {
                    res.status(500).send({message: "unable to update"})
                }
            }).catch(e => {
                console.log(e)
                res.status(500).send({error: e})
            })
        }
    })(req, res)
})

const contains = (array, element) => {
    for(var i in array) {
        if(array[i].name === element) {
            return true
        }
    }
    return false
}

app.post("/api/addClassroomComponent", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(user._id).then(user => {
                var name = req.body.componentName
                var i = 1
                while(contains(user.classroomComponents, name)) {
                    name = req.body.componentName + i
                    i++
                }
                console.log(name)
                user.classroomComponents.push({
                    name: name,
                    x: req.body.x,
                    y: req.body.y,
                    width: req.body.width,
                    height: req.body.height
                })
                userModel.updateOne(user).then(r => {
                    console.log("success")
                    res.sendStatus(200)
                }).catch(e => {
                    console.log(e)
                    res.status(500).send({error: e})
                })
            }).catch(e => {
                console.log(e)
                res.status(500).send({error: e})
            })
        }
    })(req, res)
})

app.post("/api/getClassroomComponents", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findById(req.body.userId).then(TAuser => {       
                res.status(200).send({components: TAuser.classroomComponents})
            }).catch(e => res.status(500).send({error: e}))
        }
    })(req, res)
})

app.post("/api/setClassroomComponents", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findByIdAndUpdate(user._id, {
                classroomComponents: req.body.newComponents
            }).then(r => {
                res.status(200).send({message: "updated"})
            }).catch(e => res.status(500).send({error: e}))
        }
    })(req, res)
})

app.post("/api/updateUserBio", (req, res) => {
    console.log("we get to server.js");
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findByIdAndUpdate(req.body.id, {
                bio: req.body.bio
            }).then(r => {
                if(r) {
                    res.status(201).send({message: "updated successfully"})
                }
                else {
                    res.status(500).send({message: "unable to update"})
                }
            }).catch(e => {
                console.log(e)
                res.status(500).send({error: e})
            })
        }
    })(req, res)
})

app.post("/api/updateUserBGColor", (req, res) => {
    console.log("we get to server.js");
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            userModel.findByIdAndUpdate(req.body.id, {
                bg_color: req.body.color
            }).then(r => {
                if(r) {
                    res.status(201).send({message: "updated successfully"})
                }
                else {
                    res.status(500).send({message: "unable to update"})
                }
            }).catch(e => {
                console.log(e)
                res.status(500).send({error: e})
            })
        }
    })(req, res)
})

// serve profile pictures statically 
app.use('/uploadedFiles', express.static(path.join(__dirname, '/uploadedFiles')))


// VIDEO CALLING URLS
const URLs = new Map()

app.post("/api/sendVideoURL", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const callCreatedBy = req.body.creator
            const url = req.body.url
            URLs.set(callCreatedBy, url)
            res.sendStatus(201)
        }
    })(req, res)
})

app.post("/api/getVideoURL", (req, res) => {
    passport.authenticate("jwt", {session: false}, (error, user) => {
        if(error) {
            res.status(500).send({error: error})
        }
        else if(!user) {
            res.status(401).send({error: "invalid auth"})
        }
        else {
            const user = req.body.creator
            if(URLs.has(user) == true) {
                res.json({"url": URLs.get(user)})
            }
            else {
                res.json({"error": "couldn't find a URL associated with user:"+user})
            }
        }
    })(req, res)
})

app.get("/api/logout", (req, res) => {
    req.logout(err => {
        if(err) {
            res.status(500).send(err)
        }
        else {
            res.status(200).send({message: "successfully logged out. be sure to remove the token from LS"})
        }
    })
})


// route for file upload
app.post("/api/fileUpload", upload.single('myFile'), (req, res, next) => {
    console.log(req.file.originalname + " file successfully uploaded !!");
    res.sendStatus(200);
});



const port = process.env.PORT || 3001
const server = app.listen(port, () => console.log("Listening on port " + port));
const io = require("socket.io")(server, {
    cors: {
        "origin": url
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
    console.log("Socket:", socket.id, "has connected")
    console.log("connected sockets:", printIDs(connections))
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
    socket.on("clearChildren", () => {
        connections.forEach(listeningSocket => {
            if(listeningSocket.id !== socket.id) {
                listeningSocket.emit("childClear")
            }
        })
    })
    socket.on("changeSize", (data) => {
        connections.forEach(listeningSocket => {
            if(listeningSocket.id !== socket.id) {
                listeningSocket.emit("editListenerSize", {
                    "newSize": data.newSize
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

    socket.on("chat", chat => {
        io.emit("chat", chat)
    })
    
})