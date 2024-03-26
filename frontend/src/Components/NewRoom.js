import { JitsiMeeting } from '@jitsi/react-sdk';
import {useNavigate} from "react-router-dom"
import axios from "axios";
// import Draggable, {DraggableCore} from "react-draggable";


const NewRoom = (props) => {
    // const api = useRef();
    console.log(props)
    const navigate = useNavigate()
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const api_url = DEBUGGING ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const token = localStorage.getItem("token")
    if(!token) {
        navigate("/login")
    }
    return (<>
    <JitsiMeeting
        roomName = { props.type + "-Room" + props.roomName }
        configOverwrite = {{
            subject: props.type,
            hideConferenceSubject: false
        }}
        lang = 'en'
        getIFrameRef = { (iframeRef) => { 
            if(props.URL) {
                console.log("not creating a new room")
                iframeRef.children[0].setAttribute("src", props.URL)
            }
            else {
                console.log("creating a new room")
                const data = {
                    "creator": localStorage.getItem("userID"),
                    "url": iframeRef.childNodes[0].getAttribute("src")
                }
                console.log(data)
                axios.post(api_url + "/api/sendVideoURL", data, {
                    headers: {
                        "content-type": "application/json",
                        Authorization: "Bearer " + token,
                        "ngrok-skip-browser-warning": true
                    },
                });
            }
            console.log(iframeRef); 
            iframeRef.style.height = '500px'; 
            iframeRef.style.width = '100%'; 
        } }
        />
    </>)
}

export default NewRoom

