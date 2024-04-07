import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCurrentUser, getNextStudentInLine, getQueue } from "../UserUtils"
import { io } from "socket.io-client"


const Queue = () => {
    const [isStudent, setIsStudent] = useState(null)
    const [queue, setQueue] = useState()
    const [user, setUser] = useState()
    const [joined, setJoined] = useState(false)
    const { TAid } = useParams()
    const navigate = useNavigate()
    const url = process.env.REACT_APP_DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const socket = io(url, {
        autoConnect: false,
        extraHeaders: {
            "ngrok-skip-browser-warning": true
        }
    })

    const joinQueue = () => {
        if(socket.connected === true) {
            socket.emit("join-queue", {
                taId: TAid,
                user: user
            })
            setJoined(true)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if(!token) {
            navigate("/login")
        }
        if(isStudent === null) {
            getCurrentUser().then(u => {
                const retrievedUser = u.data.user
                if(retrievedUser) {
                    if(isStudent === null && !user) {
                        setIsStudent(TAid !== retrievedUser._id)
                        setUser(retrievedUser)
                    }
                }
            })
        }
        socket.on("queue-change", getNewQueue)
        socket.on("move-me", move)
        socket.connect()
        // return () => {
        //     socket.emit("quit-queue", {
        //         taId: TAid
        //     })
        //     // socket.disconnect()
        // }
    })

    const move = () => {
        navigate(`/classrooms/${TAid}`)
    }
    const getNewQueue = () => {
        if(isStudent === false) { 
            getQueue().then(q => {

                setQueue(q)
            })
        }
    }

    const nextStudent = () => {
        getNextStudentInLine().then(studentObject => {
            const studentSocket = studentObject.socket
            socket.emit("move-student",  {
                socketToMove: studentSocket,
                TAid: TAid
            })
        }).catch(e => console.log(e))
    }

    const getSuffix = (number) => {
        if(number === 1 || number === 2 || number === "3" ) {
            const lookup = {
                1: "st",
                2: "nd",
                3: "rd"
            }
            return lookup[number]
        }
        return "th"
    }
    return (<>
    {isStudent === true ?
    <>
        {joined === true ? <div>You are {queue ? queue.length + getSuffix(queue.length) : 1 + getSuffix(1)} in line </div> : <button onClick={joinQueue}>join queue</button> }
    </>
    :
    <>
        <div>
            Students Waiting: {queue ? queue.length : 0}
            {queue && queue.map((item) => {
                return <div key={item.user?._id}>{item.user.firstName + " " + item.user.lastName}</div>
            })}
        </div>
        <button onClick={nextStudent}>help next student</button>
    </>
    
    
    }
    </>)
}

export default Queue
