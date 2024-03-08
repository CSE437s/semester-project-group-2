require("dotenv").config()
import { MongoClient } from "mongodb"
const connection_string = process.env.ATLAS_URI || "failedtogetURI"
const databaseName = "ohproject"
const client = new MongoClient(connection_string)
let conn;
try {
    conn = await client.connect()
}
catch (e) {
    console.log(e)
}

const db = conn.db(databaseName)
export default db