import axios from "axios"

const DEBUGGING_MODE = true
const url = DEBUGGING_MODE ? "http://localhost:5050" : "INSERTREALURL"

/**
 *  Helper function to create a course in the DB
 * @param className 
 * @param classDescription 
 * @param classCode 
 * @param creator 
 * @param instructorId 
 * @returns true if course was created, error otherwise
 */
export function createClass(className, classDescription, classCode, creator, instructorId) {
    return axios.post(url + "/api/createClass", {
        className: className,
        classDescription: classDescription,
        classCode: classCode,
        createdBy: creator,
        instructorId: instructorId
    })
    .then((res) => {
        console.log("created course successfully")
    }).catch((error) => {
        return {"error": error}
    })
}
