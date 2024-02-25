import { JitsiMeeting } from '@jitsi/react-sdk';
import { useEffect, useRef} from 'react'

const NewRoom = (props) => {
    // const api = useRef();
    return (<>
    <JitsiMeeting
                roomName = { props.roomName }
                configOverwrite = {{
                    subject: props.type,
                    hideConferenceSubject: false
                }}
                lang = 'en'
                getIFrameRef = { (iframeRef) => { iframeRef.style.height = '500px'; iframeRef.style.width = '70%'; } }
        />
    </>)
}

export default NewRoom

