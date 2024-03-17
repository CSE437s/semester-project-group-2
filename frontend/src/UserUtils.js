import axios from "axios"

const DEBUGGING_MODE = true
const url = DEBUGGING_MODE ? "http://localhost:5050" : "INSERTREALURL"

/**
 * getUser helper function
 * @param email 
 * @param pass 
 * @returns user profile object
 */
export function getUser(email, pass) {
    return axios.post(url + "/api/login", {
        email: email,
        password: pass,
    }, {
        withCredentials: true
    })
    .then((res) => {
        if(res.data.error ===  "\"incorrect password\"") {
            alert("incorrect password")
        }
        else {
            localStorage.setItem("token", res.data.token)
            return axios.get(url + "/api/profile", {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + res.data.token
                }
            }).then(profileRes => {
                if(profileRes) {
                    return profileRes
                }
                else {
                    return {"message": "unable to find the profile"}
                }
            }).catch(e => {
                return {"error": e}
            })
        }
    }).catch((error) => {
        return {"error": error}
    })
}

/**
 * getCurrentUser helper function to get the user, assuming that the access token was placed in local storage from getUser
 * @returns current User if token is still valid
 */
export function getCurrentUser() {
    const token = localStorage.getItem("token")
    if(!token) {
        console.log(" no token ")
        return {"error": "token is not stored"}
    }
    return axios.get(url + "/api/profile", {
        withCredentials: true,
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(profileRes => {
        if(profileRes) {
            return profileRes
        }
        else {
            return {"message": "unable to find the profile"}
        }
    }).catch(e => {
        return {"error": e}
    })
}

/**
 *  Helper function to get all of the courses a user is enrolled in as an instructor, TA, or student
 * @param  userId 
 * @returns an object containing the user's classes or null if there was an error
 */
export function getEnrolledCourses(userId) {
    return axios.post(url + "/api/userClasses", {
        id: userId
    }).then((res) => {
        const classes = res.data.classes
        return classes
    }).catch(e => {
        console.log(e)
        return null
    })
}

/**
 * Helper function to logout a user
 * @returns true if successfully logged out, error otherwise
 */
export function logout() {
    localStorage.removeItem("token")
    return axios.get(url + "/api/logout").then(res => {
        return true
    }).catch(e => {
        console.log("ERROR LOGGING OUT", e)
        return e
    })
}