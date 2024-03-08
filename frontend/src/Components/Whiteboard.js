import {useRef, useEffect} from "react"

//BOY did a lot of things help me with this
//canvas help: https://www.w3schools.com/html/html5_canvas.asp
//canvas with react help: https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
const Whiteboard = () => {
    const canvasRef = useRef(null)
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
        canvasRef.current.getContext("2d").strokeStyle = colorLookup[color]
    }
    useEffect(()=>{
        const canvasObject = canvasRef.current  
        canvasObject.width = 500
        canvasObject.height = 500
        const context = canvasObject.getContext("2d")
        let mouseDown = false
        let mouseUp = false
        let mouseDownCoords = [-1, -1]
        let mouseUpCoords = [-1, -1]
        window.onmousedown = (e) => {
            console.log(e)
            const x = e.clientX // get starting coordinates
            const y = e.clientY
            mouseDown = true // mark that we have placed the pen dowwn
            context.moveTo(x, y) // start our drawing at current coordinates
            window.onmouseup = (e) => {
                // instead of drawing from start to end, we can just draw something new when you move at all (creating smoother drawing)
                mouseDown = false // mark that we have picked up the pen
            }
        }
        window.onmousemove = (e) => {
            if(mouseDown === true) {
                const x = e.clientX
                const y = e.clientY
                context.lineTo(x, y);
                context.stroke()
            }
            else {

            }
        }
    })
    return(<>
        <canvas ref={canvasRef} />
        {/* <form onChange={getChangeColor}> */}
            <button onClick={getChangeColor} value="red">red </button>
            <button onClick={getChangeColor} value="blue">blue </button>
            <button onClick={getChangeColor} value="black">black </button>
        {/* </form> */}
    </>)
}

export default Whiteboard