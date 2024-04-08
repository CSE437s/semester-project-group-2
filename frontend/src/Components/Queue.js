import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCurrentUser, getNextStudentInLine, getQueue } from "../UserUtils"
import { io } from "socket.io-client"


const Queue = () => {
    const [isStudent, setIsStudent] = useState(null)
    const [queue, setQueue] = useState()
    const [user, setUser] = useState()
    const [joined, setJoined] = useState(false)
    const socketRef = useRef()
    const { TAid } = useParams()
    const navigate = useNavigate()
    const url = process.env.REACT_APP_DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL


    const move = () => {
        navigate(`/classrooms/${TAid}`)
    }


    const joinQueue = () => {
        // if(!socket) {
        //     const s = io(url, {
        //         autoConnect: true,
        //         extraHeaders: {
        //             "ngrok-skip-browser-warning": true
        //         }
        //     })
        //     addSocketListeners(s)
        //     setSocket(s)
        // }
        const socket = socketRef.current
        if(socket === null) {
            console.log("no socket")
            return;
        }
        console.log(socket.connected)
        if(socket.connected === false) {
            socket.connect()
        }
        if(socket.connected == true) {
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
        if(isStudent === null && !user) {
            getCurrentUser().then(u => {
                const retrievedUser = u.data?.user
                if(retrievedUser) {
                    if(isStudent === null && !user) {
                        setIsStudent(TAid !== retrievedUser._id)
                        setUser(retrievedUser)
                    }
                }
            })
        }
       
        return () => {
            if(socketRef.current.readyState === 1) {
                socketRef.current.disconnect()
            }
        }
        //eslint-disable-next-line
    },  [TAid, navigate])


    const nextStudent = () => {
        if(queue && queue.length > 0) {
            getNextStudentInLine().then(studentObject => {
                const studentSocket = studentObject.socket
                socketRef.current.emit("move-student",  {
                    socketToMove: studentSocket,
                    TAid: TAid
                })
                getQueue().then(q => {
                    if(q.length !== queue?.length) {
                        setQueue(q)
                    }
                })
            }).catch(e => console.log(e))
        }
    }

    
    useEffect(() => {
        if(!socketRef.current){ // i.e., we have not created a socket yet
            socketRef.current = io(url, {
                autoConnect: true,
                extraHeaders: {
                    "ngrok-skip-browser-warning": true
                }
            }) 
        }  
        const socket = socketRef.current
        console.log(socketRef)
        socket.connect()
        if(!socket) {
            console.log("no socket 2")
        }
        else {
            socket.on("queue-change", ()=> {
                console.log(isStudent)
                if(isStudent === false) {
                    console.log("hi")
                    getQueue().then(q => {
                        setQueue(q)
                        console.log(q)
                    })
                }
            })
        
            socket.on("move-me", move)
        
            socket.on("connect", ()=>console.log("socket connected"))
            socket.on("disconnect", ()=>console.log("socket disconnected"))
            socket.on('connect_error', (e)=>{
                console.log("error", e)
            })
        }
        return () => {
            // if(socket.readyState === 1) {
                console.log("socket will disconnect")
                socketRef.current.disconnect()
            // }
        }
        // if(socket.connected === false) {
        //     socket.connect()
        // }
        //eslint-disable-next-line
    }, [])

    
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
    <button onClick={()=>console.log(socketRef.current.connected)}>test connection</button>
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
