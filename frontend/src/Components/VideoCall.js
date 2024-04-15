import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { getCurrentUser } from "../UserUtils";
import NewRoom from "./NewRoom";
import axios from "axios"

const VideoCall = (props) => {
    const [isOwner, setIsOwner] = useState(null)
    const [roomURL, setRoomURL] = useState("")
    const [room, createRoom] = useState(undefined);
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const {TAid} = useParams()
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem("token")
        if(!token) {
            navigate("/login")
        }
        if(isOwner === null) {
            getCurrentUser().then(u => {
                const user = u.data.user
                setIsOwner(user._id === TAid)
                if(user._id !== TAid) {
                    if(!roomURL) {
                        getNewUrl(TAid);
                    }
                }
            })
        }
    })

    const getNewUrl = (roomOwner) => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
        }
        axios.post(url + "/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "application/json",
                "ngrok-skip-browser-warning": true
            },
        }).then((res) => {
            console.log(res)
            if(res.data.error) {
                console.error(res.data.error)
            }
            if (res.data.url !== "") {
                console.log("SETTING ROOM URL", res.data.url)
                setRoomURL(res.data.url);
            }
        }).catch(e => {
            console.log(e);
        });
    };

    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 10 + "." + Date.now();
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} height={props.height} width={props.width}/>);
    };

    return (<>
        {isOwner === true ? 
            room ? 
                room
                :
                <div className="flex justify-center space-x-4" style={{width: props.width, height: props.height}}>
                    {/* Classroom Name Form Card */}
                    <div className="flex-1 rounded-lg shadow-md p-8 bg-indigo-200">
                        <form onSubmit={handleSubmit} className="text-center">
                            <label htmlFor="roomtype" className="block mb-4 font-bold">What would you like to name your room?</label>
                            <input id="roomtype" type="text" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
                        </form>
                    </div>
                </div>
            :
            roomURL ?     
                <NewRoom roomName="asdf" type="asdf" URL={roomURL} height={props.height} width={props.width}/>
                :
                <div className="rounded-lg shadow-md p-8 bg-indigo-200 my-10">! There is currently no one online.</div>
        }
    
    </>)
}

export default VideoCall