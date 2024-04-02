import { useEffect, useState } from "react"
import Whiteboard from "./Whiteboard"
import ChatContainer from "./ChatContainer"
const Moveable = (props) => {
    // help starting: https://stackoverflow.com/questions/60792300/how-to-create-a-resizable-component-in-react
    // then i did moveable myself B) 

    const [specs, setSpecs] = useState ({
                                        width: props.width,
                                        height: props.height,
                                        x: props.initialX,
                                        y: props.initialY
                                        })
    const [resizing, setResizing] = useState({
                                                active: false,
                                                x: 0,
                                                y: 0
                                            })
    const [moving, setMoving] = useState({
                                                active: false,
                                                x: 0,
                                                y: 0
                                            })
    const watch = (e) => {
        if(resizing.active === true) {
            setSpecs({
                width: specs.width + e.clientX > resizing.x ? (e.clientX - resizing.x) : (resizing.x - e.clientX), // allow for both growing and shrinking
                height: specs.height + e.clientY > resizing.y ? (e.clientY - resizing.y) : (resizing.y - e.clientY),
                x: specs.x,
                y: specs.y
            })
        }
        if(moving.active === true) {
            setSpecs({
                width: specs.width,
                height: specs.height,
                x: e.clientX  - moving.x, 
                y: e.clientY - moving.y
            })
        }
    }
    const stopWatching = () => {
        if(resizing.active === true) {
            setResizing({
                active: false,
                x: resizing.x,
                y: resizing.y
            })
            props.resizingStop({width: specs.width, height: specs.height})
        }
        if(moving.active === true) {
            setMoving({
                active: false,
                x: moving.x,
                y: moving.y
            })
            props.movingStop(specs.x, specs.y)
        }
    }
    const startWatchingResize = (e) => {
        setResizing({
            active: true,
            x: e.clientX - specs.width,
            y: e.clientY - specs.height
        })
    }
    const startWatchingMove = (e) => {
        setMoving({
            active: true,
            x: e.clientX - specs.x,
            y: e.clientY - specs.y
        })
    }

    useEffect(()=> {
        window.addEventListener("mousemove", watch)
        window.addEventListener("mouseup", stopWatching)
        return () => { // remove on dismount
            window.removeEventListener("mousemove", watch)
            window.removeEventListener("mouseup", stopWatching)
        }
    })
 
    return (<div id="container" className="w-screen h-screen">
        <div id="MoveableComponent" style={{
            // width: specs.width,
            // height: specs.height,
            position: "absolute",
            top: specs.y,
            left: specs.x
        }}>
            {props.isOwner === true &&
                <div id="handle" className="bg-gray-500 py-2 hover:cursor-move" onMouseDown={startWatchingMove}  style={{
                    position: "absolute",
                    zIndex: 1,
                    width: "100%",
                }}>

                </div>
            }
            <div id="inner-container" style={{
                position: "relative",
                    width: "fit-content",
                    height: "fit-content",
                    top: "1em"
                }} >

                {
                    props.component === "whiteboard" ? 
                        <Whiteboard width={specs.width} height={specs.height}/> : 
                        (props.component === "chat" ? 
                            <ChatContainer width={specs.width} height={specs.height} /> :
                            props.component)
                }
                {props.isOwner === true && 
                <button id="handle" style={{
                    position: "absolute",
                    bottom:0,
                    right: 0,
                }} 
                onMouseDown={startWatchingResize}
                className="bg-resize  p-3 bg-no-repeat bg-cover"
                >
                    
                </button>
                }
            </div>
        </div>
    </div>)
}

export default Moveable