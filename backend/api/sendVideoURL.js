import {getURLs, addURL} from "./map.js"
const app = require("../app.js");

app.post("/", (req, res) => {
    console.log(req.body)
    const callCreatedBy = req.body.creator
    const url = req.body.url
    addURL({"key": callCreatedBy, "value": url})
    console.log(getURLs)
    res.sendStatus(201)
})