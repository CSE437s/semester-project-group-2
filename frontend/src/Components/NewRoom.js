import { JitsiMeeting } from '@jitsi/react-sdk';

import axios from "axios";

const NewRoom = (props) => {
    // const api = useRef();
    console.log(props)
    return (<>
    <JitsiMeeting
                roomName = { props.roomName }
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
                        axios.post("http://localhost:3001/api/sendVideoURL", data, {
                            headers: {
                                "content-type": "application/json",
                            },
                        });
                    }
                    console.log(iframeRef); 
                    iframeRef.style.height = '500px'; 
                    iframeRef.style.width = '70%'; 
                } }
        />
    </>)
}

export default NewRoom

