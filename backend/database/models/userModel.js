const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
import db from "./database/conn";

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
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next()
    }
    bcrypt.genSalt().then((salt) => {
        bcrypt.hash(user.password, salt).then((hashed) => {
            user.password = hashed
            next()
        }).catch(e => next(e))
    }).catch(e => next(e));
});

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;