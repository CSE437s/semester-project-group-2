import { useEffect, useRef, useState } from "react"
import AceEditor from "react-ace"
import { io } from "socket.io-client"
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-javascript";
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/theme-cobalt'
import 'ace-builds/src-noconflict/theme-terminal'
import 'ace-builds/src-noconflict/theme-tomorrow'
import 'ace-builds/src-noconflict/keybinding-emacs'
import 'ace-builds/src-noconflict/keybinding-vim'



const CodeEditor = (props) => {
    const socketRef = useRef()
    const [code, setCode] = useState("")
    const [lang, setLang] = useState(props.lang)
    const [theme, setTheme] = useState(props.theme)

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
    return (<>
        <div className="flex p-2 bg-indigo-100">
            language:
            <form className="pr-5">
                <select onChange={(e) => setLang(e.target.value)}>
                    <option>java</option>
                    <option>c</option>
                    <option>cpp</option>
                    <option>python</option>
                    <option>javascript</option>
                </select>
            </form>
            theme:
            <form>
                <select onChange={(e) => setTheme(e.target.value)}>
                    <option>github</option>
                    <option>cobalt</option>
                    <option>terminal</option>
                    <option>tomorrow</option>
                </select>
            </form>
        </div>
        <AceEditor 
            mode={lang}
            theme={theme}
            onChange={handleCode}
            value={code}
            width={props.width}
            height={props.height}
            setOptions={{
                useWorker: false,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
            }}
        />
    </>)
}
export default CodeEditor