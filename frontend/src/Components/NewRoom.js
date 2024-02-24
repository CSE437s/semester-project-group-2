import { JitsiMeeting } from '@jitsi/react-sdk';
import { useEffect, useRef} from 'react'

const NewRoom = () => {
    // const api = useRef();
    return (<>
    <JitsiMeeting
                roomName = { "vickh" }
                configOverwrite = {{
                    subject: 'lalalala',
                    hideConferenceSubject: false
                }}
                lang = 'en'
                getIFrameRef = { (iframeRef) => { iframeRef.style.height = '500px'; } }


                     />
    </>)
}

export default NewRoom


// // ssh -i "Desktop/victoriaprisco.pem" ubuntu@18.217.200.153
// //18.217.200.153