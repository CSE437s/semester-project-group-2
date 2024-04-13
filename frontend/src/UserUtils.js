import axios from "axios"

const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING
const url = DEBUGGING_MODE === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL

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
    })
    .then((res) => {
        if(res.data.error ===  "\"incorrect password\"") {
            alert("incorrect password")
        }
        else {
            localStorage.setItem("token", res.data.token)
            return axios.get(url + "/api/profile", {
                headers: {
                    Authorization: "Bearer " + res.data.token,
                    "ngrok-skip-browser-warning": true
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
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
    console.log(`Getting hours for user: ${userId} and class: ${classId}`);

    return getAllUserHours(userId).then(hoursData => {
        console.log(`Received hours data:`, hoursData);

        if (hoursData && hoursData.classId === classId) {
            console.log(`Hours for class ${classId}:`, hoursData.hours);
            return hoursData;
        } else {
            console.log(`No hours found for class ${classId} or mismatch in class IDs`);
            return [];
        }
    }).catch(e => {
        console.error(`Error fetching hours for user ${userId} and class ${classId}:`, e);
        return null;
    });
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
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
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.message === "updated successfully") {
            return true
        }
        return false
    }).catch(e => e)
}


/**
 * drops a student from a class
 * @param userId
 * @param classId
 * @param isTA
 * @returns true if successful, false otherwise
 */
export function DropStudentFromClass(userId, classId, isTA) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/dropStudentFromClass", {
        userId: userId,
        classId: classId,
        isTA : isTA
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.message === "updated successfully") {
            return true
        }
        return false
    }).catch(e => e)
}

/**
 * deletes a class
 * @param classId
 * @returns true if successful, false otherwise
 */
export function DeleteClass(classId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/deleteClass", {
        classId: classId
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.message === "deleted successfully") {
            return true
        }
        return false
    }).catch(e => e)
}


/**
 *  adds a classroom to users account
 * @param type 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 * @returns new component if successful, false otherwise
 */
export function addClassroomComponent(type, x, y, width, height) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/addClassroomComponent", {
        componentName: type,
        x: x, 
        y: y,
        width: width,
        height: height
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        if(result.status === 200) {
            return result.data.newComponent
        }
        return null
    }).catch(e => null)
}

/**
 * gets all components in a users classrooms
 * @returns components if successful, error object otherwise
 */
export function getClassroomComponents(userId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return {error: "no auth token available"}
    }
    return axios.post(url + "/api/getClassroomComponents", {
        userId: userId
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        return result.data.components
    }).catch(e => e)
}

/**
 * reset user components to new array
 * @param  newComponents 
 * @returns true if successful, false otherwise
 */
export function setClassroomComponents(newComponents) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/setClassroomComponents", {
        newComponents: newComponents
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        if(result.status === 200) {
            return true
        }
        return false
    }).catch(e => false)
}

// helper to change a user's bio
// @param userId
// @param bio

export function updateUserBio(userId, bio) {
    console.log("we get to UserUtils.js");
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/updateUserBio", {
        id: userId,
        bio: bio
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.message === "updated successfully") {
            return true
        }
        return false
    }).catch(e => e)
}

// helper to change a user's bg color
// @param userId
// @param color

export function updateUserBGColor(userId, color) {
    //console.log("we get to UserUtils.js");
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/updateUserBGColor", {
        id: userId,
        color: color
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(res => {
        if(res.data.message === "updated successfully") {
            return true
        }
        return false
    }).catch(e => e)
}
  
export function sendNewVideoURL(videoURL) {
    const token = localStorage.getItem("token")
    if(!token) {
        return {error: "redirect to login"}
    }
    return getCurrentUser().then(u => {
        const user = u.data.user
        const data = {
            "creator": user._id,
            "url": videoURL
        }
        console.log(data)
        return axios.post(url + "/api/sendVideoURL", data, {
            headers: {
                "content-type": "application/json",
                Authorization: "Bearer " + token,
                "ngrok-skip-browser-warning": true
            },
        }).then(result => {
            if(result.status === 201) {
                return true
            }
            return false
        });
    })
}

/**
 * finds classroom settings associated with currently logged in user (might have to change to take in TA id and look that up)
 * @returns classroom settings in the databse
 */
export function getClassroomSettings(id) {
    const token = localStorage.getItem("token")
    if(!token) {
        return {error: "redirect to login"}
    }
    return axios.post(url + "/api/getClassroomSettings", {
        TAid: id
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        if(result.status === 200) {
            return result.data.settings
        }
        return null
    }).catch(e => null)
}
/**
 * get the queue for a user's classroom 
 * @param id: user id of the queue of interest
 * @returns queue if successful, null otherwise
 */
export function getQueue(queueId) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/getQueue", {
        id: queueId
    },{
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
        
    }).then(result => {
        if(result.status === 200) {
            return result.data.queue
        }
        return null
    }).catch(e => {
        if(e.response.status === 404) {
            return []
        }
        return null
    }).catch(e => null)
}



/**
 * sets a TA's classroom settings
 * @param new classroom settings object
 * @returns true if successful, false otherwise
 */
export function setClassroomSettings(newSettings) {
    const token = localStorage.getItem("token")
    if(!token) {
        return {error: "redirect to login"}
    }
    return axios.post(url + "/api/setClassroomSettings", {
        classroomSettings: newSettings
    }, {
            headers: {
                Authorization: "Bearer " + token,
                "ngrok-skip-browser-warning": true
            }
    }).then(result => {
        if(result.status === 201) {
            return true
        }
        return false
    }).catch(e => false)
}


/**
 * get the next student ID from the queue
 * @returns student ID if successful, null otherwise
 */
export function getNextStudentInLine() {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.get(url + "/api/pullOffQueue", {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        if(result.status === 200) {
            return result.data 
        }
        return null
    }).catch(e => {
        if(e.response.status === 404) {
            console.log("no such student")
        }
        return null
    })
}


/**
 * Tests classroom password with user input to see if correct
 * @param password 
 * @param  TAid 
 * @returns true if password is correct, false if it is incorrect, null if something else went wrong
 */
export function testClassroomPassword(password, TAid) {
    const token = localStorage.getItem("token")
    if(!token) {
        return null
    }
    return axios.post(url + "/api/compareClassroomPassword", {
        password: password,
        TAid: TAid
    }, {
        headers: {
            Authorization: "Bearer " + token,
            "ngrok-skip-browser-warning": true
        }
    }).then(result => {
        if(result.status === 200) {
            return true
        }
        return null
    }).catch(e => {
        if(e.response.status === 401) {
            return false
        }
        return null
    })
}