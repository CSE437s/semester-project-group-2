import { useState, useEffect } from "react"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
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
            <form onSubmit={handleSubmit} className="text-center">
                <label htmlFor="roomtype" className="block">What would you like to name your room?</label>
                <input id="roomtype" type="text" className="border border-gray-300 rounded px-4 py-2 mt-2" />
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
            </form>
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
