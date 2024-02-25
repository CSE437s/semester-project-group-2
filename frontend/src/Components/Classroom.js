import { useState } from "react"
import {auth} from "../firebase"
import NewRoom from "./NewRoom"


const Classroom = () => {
    const [room, createRoom] = useState(undefined)
    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 1000 + "."+ Date.now()
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value}/>)
    }
    return (<>
        <h1>Welcome to your classroom :)</h1>
        {room ? room : <form onSubmit={handleSubmit}>
            What would you like to name your room?
            <input id="roomtype" type="text"/>
        </form>}
    </>)
}
export default Classroom