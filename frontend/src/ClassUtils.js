import axios from "axios"

const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING
const url = DEBUGGING_MODE ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"

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
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/createClass", {
        className: className,
        classDescription: classDescription,
        classCode: classCode,
        createdBy: creator,
        instructorId: instructorId
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    })
    .then((res) => {
        console.log("created course successfully")
        return joinClass(classCode, instructorId, "instructor").then(value => {
            if(value === true) {
                return true
            }
        }).catch(e => {
            return {error: e}
        })
    }).catch((error) => {
        return {"error": error}
    })
}

/**
 * Helper function that will enroll a user in a specified course
 * @param  classCode 
 * @param userId 
 * @param  newRole 
 * @returns true if successfully joined, error otherwise
 */
export function joinClass(classCode, userId, newRole) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/enrollInCourse", {
        id: userId,
        courseId: classCode,
        newRole: newRole
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        return true
    }).catch(e => {
        return e
    })
}

/**
 * getClass helper function
 * @param classCode 
 * @returns classObject if successfully found, null otherwise
 */
export function getClassByCode(classCode) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/getClass", {
        classCode: classCode
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.class) {
            return res.data.class
        }
        return null
    }).catch(e => {
        return null
    })
}

/**
 * helper function that finds class by ID
 * @param  classId 
 * @returns class if found, null otherwise
 */
export function getClassByID(classId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/getClassById", {
        classId: classId
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.class) {
            return res.data.class
        }
        return null
    }).catch(e => {
        return null
    })
}