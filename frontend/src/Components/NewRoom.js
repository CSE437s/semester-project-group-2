import { JitsiMeeting } from '@jitsi/react-sdk';
import {useNavigate} from "react-router-dom"
import { sendNewVideoURL } from '../UserUtils';


const NewRoom = (props) => {
    // const api = useRef();
    console.log(props)
    const navigate = useNavigate()
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
                sendNewVideoURL(iframeRef.children[0].getAttribute("src")).then(result => {
                    if(result === true) {
                        console.log('successfully added room URL')
                    }
                    if(result.error) {
                        console.log(result.error)
                    }
                }).catch(e => console.log(e))
            }
            console.log(iframeRef); 
            iframeRef.style.height = props.height; 
            iframeRef.style.width = props.width; 
        } }
        />
    </>)
}

export default NewRoom

