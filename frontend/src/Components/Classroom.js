import { useState, useEffect } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import NewRoom from "./NewRoom"
import { useParams } from "react-router-dom"
import axios from "axios"

const Classroom = () => {
    const [room, createRoom] = useState(undefined)
    const [name, setName] = useState("")
    const [roomURL, setRoomURL] = useState("")

    const currentUser = localStorage.getItem("userID")

    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser);
            if (userDocRef) {
                getDoc(userDocRef).then((d) => {
                    const docData = d.data()
                    setName(docData.email)
                }).catch((error) => {
                    console.log(error)
                })
            }
        }
    }, [currentUser])

    const instructor = useParams("TAid")
    const isOwner = currentUser === instructor.TAid

    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 1000 + "." + Date.now()
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} />)
    }

    const getNewUrl = (roomOwner) => {
        axios.post("http://localhost:3001/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "content-type": "application/json",
            },
        }).then((res) => {
            setRoomURL(res.data.url)
        }).catch(e => {
            console.log(e)
        })
    }
    var dates = []
    const removeElement = (element) => {
        const newDates = []
        for(var day in dates) {
            if(dates[day] !== element) {
                newDates.push(dates[day])
            }
        }
        dates = newDates
     }
    const handleDayPicker = (e) => {
        e.preventDefault()
        const day = e.target.value
        const color = e.target.style.backgroundColor
        if(color !== '' && color !== "white") { // deselecting
            e.target.style.backgroundColor = "white"
            removeElement(day)
        }
        else { //  selecting
            e.target.style.backgroundColor = "red"
            dates.push(day)
        }
        console.log(dates)
    }
    const sendTimeInformation = (e) => {
        e.preventDefault()
        const start_time = e.target.start_time.value
        const end_time = e.target.end_time.value
        const userRef = doc(db, "users", currentUser);
        if(!userRef) {
            console.log("cannot find user document with that user ID")
        }
        setDoc(userRef, {
            OHtimes: {
                days: dates,
                start: start_time,
                end: end_time
            }
        }, { merge: true }).then(()=>{
            console.log("successfully updated office hours schedule")
        }).catch(e => console.log(e))
        // TODO after MVP, move API requests to backend/
        // axios.post("/api/updateOHTime", officeHours, {
        //     headers: {
        //         "content-type": "application/json"
        //     }
        // }).then(() => {
        //     console.log("sent!")
        // }).catch((res) => {
        //     console.log(res)
        //     if(res.response.status === 404) {
        //         console.log("!! ERROR: user not found" + res.error)
        //     }
        //     else if (res.response.status === 400) {
        //         console.log("!! ERROR:", res.systemerror)
        //     }
        // })
        dates = []
    }
    let render;
    if (isOwner === false) {
        if (roomURL) {
            const roomToJoin = <NewRoom roomName="asdf" type="asdf" URL={roomURL} />
            render = roomToJoin
        }
        else {
            getNewUrl(instructor.TAid)
        }
    }
    else {
        render = room ? room : (
            <>
            <form onSubmit={handleSubmit} className="text-center">
                <label htmlFor="roomtype" className="block">What would you like to name your room?</label>
                <input id="roomtype" type="text" className="border border-gray-300 rounded px-4 py-2 mt-2" />
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
            </form>
            <form onSubmit={sendTimeInformation}>
                <label>When would you like to host your office hours?</label>
                <label>from</label>
                <input type="time" name="start_time"/>
                <label>until</label>
                <input type="time" name="end_time"/>
                <button onClick={handleDayPicker} value="M">M </button> 
                <button onClick={handleDayPicker} value="T">T </button> 
                <button onClick={handleDayPicker} value="W">W </button> 
                <button onClick={handleDayPicker} value="Th">Th </button> 
                <button onClick={handleDayPicker} value="F">F </button> 
                <button onClick={handleDayPicker} value="S">S </button> 
                <button onClick={handleDayPicker} value="Su">Su</button> 
                <button type="submit">Submit</button>
            </form>
            </>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-center mb-4">{isOwner ? "Welcome to your Classroom" : `Welcome to ${name}'s Classroom!`}</h1>
            {render}
        </div>
    )
}

export default Classroom
