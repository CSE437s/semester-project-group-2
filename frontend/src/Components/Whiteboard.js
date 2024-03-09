import {useRef, useEffect, useState} from "react"

import { io } from "socket.io-client"
// import { socket } from "../FEsocket
//BOY did a lot of things help me with this
//canvas help: https://www.w3schools.com/html/html5_canvas.asp
//canvas with react help: https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
const Whiteboard = () => {
    const [isConnected, setConnected] = useState(false)
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)
    const socket = io("http://localhost:3001", {
        autoConnect: false
    })
    const getChangeColor = (e) => {
        e.preventDefault()
        const color = e.target.value
        console.log("changing to", color)
        changeColor(color)
    }
    const changeColor = (color) => {
        const colorLookup = {
            "red": "#FF0000",
            "blue": "#0500FF",
            "black": "#000000"
        }
        context.strokeStyle = colorLookup[color]
        socket.emit("colorChange", {
            "newColor": colorLookup[color]
        })
    }
    const clear = () => {
        context.reset()
    }
    const onConnect = () => {
        setConnected(true)
    }
    const onDisconnect = () => {
        setConnected(false)
    }
    useEffect(()=>{
        const canvasObject = canvasRef.current  
        setContext(canvasObject.getContext("2d"))
        canvasObject.width = 500
        canvasObject.height = 500
        let mouseDown = false
        window.onmousedown = (e) => {
            console.log(e)
            const x = e.clientX // get starting coordinates
            const y = e.clientY
            mouseDown = true // mark that we have placed the pen dowwn
            context.moveTo(x, y) // start our drawing at current coordinates
            context.beginPath()
            socket.emit("begin-draw", {
                "x": x,
                "y": y,
            })
            window.onmouseup = (e) => {
                // instead of drawing from start to end, we can just draw something new when you move at all (creating smoother drawing)
                mouseDown = false // mark that we have picked up the pen
            }
        }
        window.onmousemove = (e) => {
            if(mouseDown === true) {
                const x = e.clientX
                const y = e.clientY
                socket.emit("end-draw", { // alert all of the other sockets that we have drawn something and have them display it
                    "x": x,
                    "y":y ,
                })
                context.lineTo(x, y);
                context.stroke()
            }
            else {
                socket.emit("closePath")
                context.closePath()
            }
        }
        
        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on('connect_error', (e)=>{
            console.log("error", e)
        })
        socket.on("start-drawing", (coordinates) => {
            context.moveTo(coordinates.x, coordinates.y)
            context.beginPath()
            socket.on("get-drawing", (coordinates) => {
                context.lineTo(coordinates.x, coordinates.y)
                context.stroke()
                socket.on("closePath", () => {
                    context.closePath()
                })
            })
        })
        socket.on("changeMyColor", (data)=> {
            console.log("CHANGING COLOR?")
            context.strokeStyle = data.newColor
        })
        socket.connect()
        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.disconnect()
        }
    })
    return(<>
        <p>{isConnected}</p>
        <canvas ref={canvasRef} />
        <button onClick={getChangeColor} value="red">red </button>
        <button onClick={getChangeColor} value="blue">blue </button>
        <button onClick={getChangeColor} value="black">black </button>
        <button onClick={clear} value="clear">clear</button>
    </>)
}

export default Whiteboard