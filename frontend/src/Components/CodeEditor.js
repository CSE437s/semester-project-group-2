import { useEffect, useRef, useState } from "react"
import AceEditor from "react-ace"
import { io } from "socket.io-client"
import "ace-builds/src-noconflict/mode-java";
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/theme-cobalt'



const CodeEditor = (props) => {
    const socketRef = useRef()
    const [code, setCode] = useState("")

    const url = process.env.REACT_APP_DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL

    const handleCode = (newCode) => {
        socketRef.current.emit("code-written", {
            code: newCode
        })
        setCode(newCode)
    }
    useEffect(()=> {
        if(!socketRef.current){ // i.e., we have not created a socket yet
            socketRef.current = io(url, {
                autoConnect: true,
                extraHeaders: {
                    "ngrok-skip-browser-warning": true
                }
            }) 
        }  
        const socket = socketRef.current
        socket.connect()
        if(socket) {
            socket.on("read-code", (data) => {
                setCode(data.code)
            })
        }
    })

    console.log(props.lang)

    return (<>
        <AceEditor 
            mode={props.lang}
            theme={props.theme}
            onChange={handleCode}
            value={code}
            width={props.width}
            height={props.height}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
            }}
        />
    </>)
}
export default CodeEditor