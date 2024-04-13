import { useNavigate, useParams } from "react-router-dom"
import Queue from "./Queue"
import { useEffect, useState } from "react"
import { findUser, getClassroomSettings, getCurrentUser, testClassroomPassword } from "../UserUtils"
import Header from "./Header"

const JoinClassroom = () => {
    const [TA, setTA] = useState()
    const [user, setUser] = useState()
    const [settings, setSettings] = useState()
    const {TAid} = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        if(!TA) {
            findUser(TAid).then(TAuser => {
                setTA(TAuser)
            })
        }
        if(!user) {
            getCurrentUser().then(userObject => {
                const user = userObject.data.user
                setUser(user)
            })
        }
        if(!settings) {
            getClassroomSettings(TAid).then(newSettings => {
                if(newSettings.queueEnabled === false && newSettings.passwordEnabled === false) {
                    navigate(`/classrooms/${TAid}`)
                }
                else if(newSettings.queueEnabled === false) {
                    const password = prompt("put the password in dweeb")
                    console.log(password, TAid)
                    testClassroomPassword(password, TAid).then(result => {
                        if(result === true) {
                            navigate(`/classrooms/${TAid}`)
                        }
                        else if(result === false) {
                            alert("Wrong password. Please try again or contact your TA.")
                        }
                        else {
                            alert("Something went wrong. Please try again later.")
                        }
                    })
                }
                setSettings(newSettings)
            })
        }
        //eslint-disable-next-line
    }, []) // only run the getters if the variables have changed 
    return (<>
        <Header />
        {user?._id !== TAid ? 
        <div>
        You are currently waiting to join { TA ? TA.firstName + "'s classroom" : "a classroom"}. Please wait here until redirected. Refreshing will lose your place in line. 
        </div>
        :
        <div>
        Here is your classroom waiting page. Queue information can be found below.
        </div>
        }
        <Queue />
    </>)
}

export default JoinClassroom