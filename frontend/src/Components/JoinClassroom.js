import { useNavigate, useParams } from "react-router-dom"
import Queue from "./Queue"
import { useEffect, useState } from "react"
import { findUser, getClassroomSettings, getCurrentUser, testClassroomPassword } from "../UserUtils"
import Header from "./Header"

const JoinClassroom = () => {
    const [TA, setTA] = useState()
    const [user, setUser] = useState()
    const [settings, setSettings] = useState()
    const { TAid } = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        if (!TA) {
            findUser(TAid).then(TAuser => {
                setTA(TAuser)
            })
        }
        if (!user) {
            getCurrentUser().then(userObject => {
                const user = userObject.data.user
                setUser(user)
            })
        }
        if (!settings) {
            getClassroomSettings(TAid).then(async newSettings => {
                const getUser = await getCurrentUser()
                if (!getUser) {
                    return
                }
                const user2 = getUser.data.user
                if (user2._id === TAid || (user2.role === "instructor" && newSettings.instructorsAllowed === true) || (newSettings.queueEnabled === false && newSettings.passwordEnabled === false)) {
                    navigate(`/classrooms/${TAid}`)
                }
                else if (newSettings.queueEnabled === false) {
                    const password = prompt("put the password in dweeb")
                    console.log(password, TAid)
                    if (password) {
                        testClassroomPassword(password, TAid).then(result => {
                            if (result === true) {
                                navigate(`/classrooms/${TAid}`)
                            }
                            else if (result === false) {
                                alert("Wrong password. Please try again or contact your TA.")
                            }
                            else {
                                alert("Something went wrong. Please try again later.")
                            }
                        })
                    }
                }
                setSettings(newSettings)
            })
        }
        //eslint-disable-next-line
    }, []) // only run the getters if the variables have changed 
    return (<>
        <Header />

        {user?._id !== TAid ?
            <div className="font-mono bg-indigo-50 h-dvh text-center">
                <div className="flex justify-center p-10 pb-4">
                    <div className="shadow-md rounded px-8 pt-8 pb-8 mb-4 w-full max-w-lg bg-indigo-300 flex flex-col">
                        You are currently waiting to join {TA ? TA.firstName + "'s classroom" : "a classroom"}. Refreshing will lose your place.
                        
                        <Queue />
                        </div>
                    
                </div>
            </div>

            :
            <div>
                Here is your classroom waiting page. Queue information can be found below.
            </div>
        }

    </>)
}

export default JoinClassroom