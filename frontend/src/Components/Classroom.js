import { useState, useEffect } from "react"
import {auth, db} from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import NewRoom from "./NewRoom"
import { useParams } from "react-router-dom"
import axios from "axios"


const Classroom = () => {
    const [room, createRoom] = useState(undefined)
    const [name, setName] = useState("")
    const [roomURL, setRoomURL] = useState("")

    // const waitForCurrentUser = () => {
    //     if(auth.currentUser === null || auth.currentUser === undefined) {
    //         console.log("! not loaded yet")
    //         console.log(auth.currentUser)
    //         setTimeout(waitForCurrentUser, 10)
    //     }
    //     else {
    //         return auth.currentUser
    //     }
    // }
    // const currentUser = waitForCurrentUser()
    const currentUser = localStorage.getItem("userID")
    console.log("current user", currentUser)
    useEffect(()=>{
        if(currentUser) {
            const userDocRef = doc(db, "users", currentUser);
            if(userDocRef) {
                getDoc(userDocRef).then((d)=>{
                    const docData = d.data()
                    console.log(docData)
                    setName(docData.email)
                }).catch((error)=> {
                    console.log(error)
                })
            }
        }
    })
    const instructor = useParams("TAid")
    const isOwner = currentUser === instructor.TAid
    console.log(isOwner)
    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 1000 + "."+ Date.now()
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value}/>)
    }
    const getNewUrl = (roomOwner) => {
        axios.post("http://localhost:3001/api/getVideoURL", {"creator": roomOwner}, {
            headers: {
                "content-type": "application/json",
            },
        }).then((res)=>{
            setRoomURL(res.data.url)
        }).catch(e => {
            console.log(e)
        })
    }
    var render;
    if(isOwner === false) {
        console.log("hello")
        getNewUrl(instructor.TAid)
        const roomToJoin = <NewRoom roomName="asdf" type="asdf" URL={roomURL}/>
        // roomToJoin..setAttribute("src", roomURL)
        console.log(roomToJoin)
        render = roomToJoin

    }
    else {
        render = room ? room : <form onSubmit={handleSubmit}>
                                    What would you like to name your room?
                                    <input id="roomtype" type="text"/>
                                </form>
    }
    return (<>
        {isOwner === true ? <h1> Welcome to your Classroom</h1> : <h1> Welcome to {name}'s Classroom!</h1>}
        {render}
        
    </>)
}
export default Classroom