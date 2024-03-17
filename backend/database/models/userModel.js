const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
require("dotenv").config()
// from: https://medium.com/@anandam00/build-a-secure-authentication-system-with-nodejs-and-mongodb-58accdeb5144

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String, 
      required: true,
      unique: false
    },
    role: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
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
