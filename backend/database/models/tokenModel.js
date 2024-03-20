const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
require("dotenv").config()
// from: https://medium.com/@anandam00/build-a-secure-authentication-system-with-nodejs-and-mongodb-58accdeb5144

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expiresIn: 3600 // an hour
    }
  },
  { timestamps: true }
);

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
