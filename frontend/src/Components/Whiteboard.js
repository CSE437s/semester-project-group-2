import {useRef, useEffect, useState} from "react"
import { io } from "socket.io-client"
//BOY did a lot of things help me with this
//canvas help: https://www.w3schools.com/html/html5_canvas.asp
//canvas with react help: https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
const Whiteboard = (props) => {
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;;
    const url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const socket = io(url, {
        autoConnect: false,
        extraHeaders: {
            "ngrok-skip-browser-warning": true
        }
    })
    const editWidth = (e) => {
        const percentage = e.target.value
        const max = 20
        const min = 1
        const size = Math.floor((percentage / 100.0) * (max-min) + 1)
        resize(size)
    }
    const resize = (newSize) => {
        context.lineWidth = newSize
        socket.emit("changeSize", {
            "newSize": newSize
        })
    }
    const getChangeColor = (e) => {
        e.preventDefault()
        const color = e.target.value
        changeColor(color)
    }
    const changeColor = (color) => {
        const colorLookup = {
            "red": "#FF0000",
            "blue": "#0500FF",
            "black": "#000000",
            "erase": "#FFFFFF"
        }
        if(color === "erase") {
            context.lineWidth = 15
        }
        else {
            context.lineWidth = 1
        }
        context.strokeStyle = colorLookup[color]
        socket.disconnect()
        socket.connect() // reconnect local socket
        socket.emit("colorChange", {
            "newColor": colorLookup[color]
        })
    }
    const clear = () => {
        context.fillStyle="white"
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        socket.emit("clearChildren")
    }
    const onConnect = () => {
        console.log("socket has been connected to server")
        // setConnected(true)
    }
    const onDisconnect = () => {
        console.log("socket was disconnected")
        // setConnected(false)
    }
    useEffect(()=>{
        const canvasObject = canvasRef.current  
        if(!canvasObject) {
            return
        }
        const localContext = canvasObject.getContext("2d")
        if(context === null) {
            setContext(canvasObject.getContext("2d"))
        }
        canvasObject.width = props.width
        canvasObject.height = props.height
        let mouseDown = false
        if(!canvasObject || canvasObject === null) {
            return
        }
        window.onmousedown = (e) => {
            var x = e.offsetX //  get starting coordinates
            var y =  e.offsetY 
            mouseDown = true // mark that we have placed the pen down
            if(e.target.id === "canvas" && x >= 0 && x < props.width && y >= 0 && y < props.height) {

                localContext.moveTo(x, y) // start our drawing at current coordinates
                localContext.beginPath()
                socket.emit("begin-draw", {
                    "x": x,
                    "y": y,
                })
                window.onmouseup = (e) => {
                    // instead of drawing from start to end, we can just draw something new when you move at all (creating smoother drawing)
                    mouseDown = false // mark that we have picked up the pen
                }
            }
            else {
                mouseDown = false // you drew out of bounds. we wont have it
            }

        }
        window.onmousemove = (e) => {
            if(mouseDown === true) {
                var x = e.offsetX  // get starting coordinates
                var y = e.offsetY
                if(x < 0 || x > props.width || y > props.height || y < 0) {
                    mouseDown = false
                    return
                }
                // if(y >= 0 && y <= props.height) {
                    socket.emit("end-draw", { // alert all of the other sockets that we have drawn something and have them display it
                        "x": x,
                        "y": y,
                    })
                    localContext.lineTo(x, y);
                    localContext.stroke()
                // }
            }
            else {
                socket.emit("closePath")
                localContext.closePath()
            }
        }
        
        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on('connect_error', (e)=>{
            console.log("error", e)
        })
        socket.on("start-drawing", (coordinates) => {
            localContext.moveTo(coordinates.x, coordinates.y)
            localContext.beginPath()
            socket.on("get-drawing", (coordinates) => {
                localContext.lineTo(coordinates.x, coordinates.y)
                localContext.stroke()
                socket.on("closePath", () => {
                    localContext.closePath()
                })
            })
        })
        socket.on("childClear", () => {
            localContext.fillStyle="white"
            localContext.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        })
        socket.on("changeMyColor", (data)=> {
            localContext.strokeStyle = data.newColor
            if(data.newColor === "#FFFFFF") {
                localContext.lineWidth = 15
            }
            else {
                localContext.lineWidth = 1
            }
        })
        socket.on("editListenerSize", (data) => {
            localContext.lineWidth = data.newSize
        })
        socket.connect()
        return () => {
            socket.disconnect()
        }
        // eslint-disable-next-line
    }, [context, props.height, props.width])
    return(<>
        <div className="border-8 border-gray-300 bg-white rounded block w-fit h-fit">
            <canvas id="canvas" ref={canvasRef} width={props.width} height={props.height}/>
            <button onClick={getChangeColor} value="red" className="border-2 rounded-full bg-red-600 p-3 m-2"> </button>
            <button onClick={getChangeColor} value="blue" className="border-2 rounded-full bg-blue-600 p-3 m-2"> </button>
            <button onClick={getChangeColor} value="black" className="border-2 rounded-full bg-black p-3 m-2"></button>
            <button onClick={getChangeColor} value="erase" className="bg-eraser p-4 bg-no-repeat bg-cover m-2"></button>
            <button onClick={clear} value="clear" className="bg-clear p-3 bg-no-repeat bg-cover m-2"></button>
            <input type="range" min="1" max="100" className="m-2" onChange={editWidth}/>
        </div>
    </>)
}

export default Whiteboard