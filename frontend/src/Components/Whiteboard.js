import {useRef, useEffect, useState} from "react"
import { io } from "socket.io-client"
//BOY did a lot of things help me with this
//canvas help: https://www.w3schools.com/html/html5_canvas.asp
//canvas with react help: https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
const Whiteboard = (props) => {
    const [isConnected, setConnected] = useState(false)
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)
    const DEBUGGING = false;
    const base_url = "wss://carefully-certain-swift.ngrok-free.app";
    const debugging_url = "http://localhost:5050";
    const url = DEBUGGING ? debugging_url : base_url;
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
        context.reset()
        socket.emit("clearChildren")
    }
    const onConnect = () => {
        console.log("socket has been connected to server")
        setConnected(true)
    }
    const onDisconnect = () => {
        console.log("socket was disconnected")
        setConnected(false)
    }
    useEffect(()=>{
        const canvasObject = canvasRef.current  
        const localContext = canvasObject.getContext("2d")
        if(context === null) {
            setContext(canvasObject.getContext("2d"))
        }
        canvasObject.width = props.width
        canvasObject.height = props.height
        const xOffset = canvasRef.current.offsetLeft
        const yOffset = canvasRef.current.offsetTop
        let mouseDown = false
        if(!canvasObject || canvasObject === null) {
            return
        }
        window.onmousedown = (e) => {
            var x = e.pageX - xOffset  // get starting coordinates
            var y = e.pageY - yOffset 
            mouseDown = true // mark that we have placed the pen down
            if(x >= 0 && x < props.width && y >= 0 && y < props.height) {

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
                var x = e.pageX - xOffset  // get starting coordinates
                var y = e.pageY - yOffset
                if(x < 0) {
                    x = 0
                }
                else if(x > props.width) {
                    x = props.width
                }
                if(y < 0) {
                    y = 0
                }
                else if(y > props.height) {
                    y = props.height
                }
                if(y >= 0 && y <= props.height) {
                    socket.emit("end-draw", { // alert all of the other sockets that we have drawn something and have them display it
                        "x": x,
                        "y": y,
                    })
                    localContext.lineTo(x, y);
                    localContext.stroke()
                }
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
            localContext.reset()
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
        <p>{isConnected}</p>
        <canvas ref={canvasRef} />
        <button onClick={getChangeColor} value="red">red </button>
        <button onClick={getChangeColor} value="blue">blue </button>
        <button onClick={getChangeColor} value="black">black </button>
        <button onClick={getChangeColor} value="erase">erase</button>
        <button onClick={clear} value="clear">clear</button>
        <input type="range" min="1" max="100" onChange={editWidth}/>
    </>)
}

export default Whiteboard