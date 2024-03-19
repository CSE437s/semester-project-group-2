const mongoose = require("mongoose");
require("dotenv").config()
// from: https://medium.com/@anandam00/build-a-secure-authentication-system-with-nodejs-and-mongodb-58accdeb5144

const hoursSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true,
      unique: false,
    },
    className: {
      type: String,
      required: true,
      unique: false,
    },
    userId: {
      type: String,
      required: true,
      unique: false,
    },
    hours: {
        type: Array,
        required: true,
        unique: false
    }
  }
);

const Hours = mongoose.model("Hours", hoursSchema);

module.exports = Hours;
