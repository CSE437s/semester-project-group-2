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
        console.log(e)
        if(e.response) {
            if(e.response.status === 401) {
                console.log("token has expired")
                return {"message": "token has expired. logout and redirect to login", status: 401}
            }
        } 
        else {
            return {error: e}
        }
    })
}

/**
 *  Helper function to get all of the courses a user is enrolled in as an instructor, TA, or student
 * @param  userId 
 * @returns an object containing the user's classes or null if there was an error
 */
export function getEnrolledCourses(userId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/userClasses", {
        id: userId
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
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

/**
 * find and return specified user object
 * @param userId 
 * @returns user object if user exists, null otherwise
 */
export function findUser(userId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/findUser", {
        id: userId
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(res => {
        const user = res.data.user
        if(user) {
            return user
        }
        return null
    }).catch(e => null)
}

/**
 * get all of the hours objects associated with a user 
 * @param  userId 
 * @returns array of hour objects if successful, null otherwise
 */
export function getAllUserHours(userId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/getHours", {
        userId: userId
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(res => {
        if(res.error) {
            return null;
        }
        else {
            return res.data.hours
        }
    })
}

/**
 * helper function to get user hours for specified class
 * @param userId 
 * @param classId 
 * @returns hours for that class, undefined if they don't exist or null if something goes wrong
 */
export function getUserHoursForClass(userId, classId) {
    return getAllUserHours(userId).then(hours => hours.filter((hour) => {
        return hour.classId === classId
    })).catch(e => null)
}

/**
 * add hours to database and ID to user's list of IDs
 * @param userId 
 * @param className 
 * @param classId 
 * @param hours 
 * @returns true if successful, false otherwise
 */
export function addUserHours(userId, className, classId, hours) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/addHours", {
        classId: classId,
        className: className,
        userId: userId,
        hours: hours
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(res => {
        if(res.status === 200) {
            return true
        } 
        else {
            return false
        }
    }).catch(e => false)
}

/**
 * change a user's role in a specified class
 * @param userId 
 * @param classId 
 * @param oldRole 
 * @param newRole 
 * @returns true if successful, false otherwise
 */
export function changeRoleInClass(userId, classId, oldRole, newRole) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/changeRoleInClass", {
        userId: userId, 
        classId: classId,
        oldRole: oldRole,
        newRole: newRole
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(res => {
        if(res.data.message === "successfully updated") {
            return true
        }
        return false
    }).catch(e => false)
}

/**
 * helper to chcange a user's name
 * @param userId 
 * @param firstName 
 * @param lastName 
 * @returns true if successful, false if something happens, error if one is caught
 */
export function updateUserName(userId, firstName, lastName) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/updateUserName", {
        id: userId,
        firstName: firstName,
        lastName: lastName
    }, {
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(res => {
        if(res.data.message === "updated successfully") {
            return true
        }
        return false
    }).catch(e => e)
}