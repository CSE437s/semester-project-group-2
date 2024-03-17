const mongoose = require("mongoose");
require("dotenv").config()
// from: https://medium.com/@anandam00/build-a-secure-authentication-system-with-nodejs-and-mongodb-58accdeb5144

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      unique: false,
    },
    classDescription: {
      type: String,
      required: false,
      unique: false,
    },
    classCode: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
        type: String,
        required: true,
        unique: false
    },
    instructorId: {
        type: String,
        required: true,
        unique: false
    },
    TAs: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
    students: {
      type: Array,
      required: false,
      unique: false,
      default: []
    },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
