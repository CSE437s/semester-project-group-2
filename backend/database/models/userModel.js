const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
require("dotenv").config()
// from: https://medium.com/@anandam00/build-a-secure-authentication-system-with-nodejs-and-mongodb-58accdeb5144

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      unique: false,
      default: "HUH"
    },
    firstName: {
      type: String,
      required: true,
      unique: false,
    },
    lastName: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      required: false,
      default: "http://res.cloudinary.com/dp1gbz22c/image/upload/v1713816597/sbnw79txcuefkazgbp1p.png"
    },
    password: {
      type: String, 
      required: true,
      unique: false
    },
    role: {
      type: String,
      enum: ["student", "instructor","admin"],
      default: "student",
    },
    org: {
      type: String,
      required: false,
      unique: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "approved", // FIXME 
    },
    classesAsInstructor: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    classesAsTA: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    classesAsStudent: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    hours: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    classroomComponents: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    bio: {
      type: String,
      required: false,
      unique: false,
      default: ""
    },
    bg_color: {
      type: String,
      required: false,
      unique: false,
      default: "white"
    },
    classroomSettings: {
      type: Object,
      required: false,
      unique: false,
      default: {
        queueEnabled: false,
        passwordEnabled: false,
        password: undefined
      }
    }
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next()
    }
    bcrypt.genSalt(10).then((salt) => {
        bcrypt.hash(user.password, salt).then((hashed) => {
            user.password = hashed
            next()
        }).catch(e => next(e))
    }).catch(e => next(e));
});

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password).then((res) =>{
    return res
  });
};

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema);

module.exports = User;
