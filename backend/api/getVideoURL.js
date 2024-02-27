import {getURLs} from "./map.js"
const app = require("../app.js");

app.post("/api", (req, res) => {
    const user = req.body.creator
    if(getURLs().has(user) == true) {
        console.log("returning the URL")
        res.json({"url": getURLs(user)})
    }
    else {
        res.json({"error": "couldn't find a URL associated with user:"+user})
    }
})