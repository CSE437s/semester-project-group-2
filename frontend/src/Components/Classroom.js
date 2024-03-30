import { useState, useEffect } from "react";
// import LogoutButton from './LogoutButton';
import NewRoom from "./NewRoom";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
// import OHschedule from "./OHSchedule";
import { getCurrentUser, findUser, getAllUserHours, getClassroomComponents, setClassroomComponents, addClassroomComponent } from "../UserUtils";
// import { getClassByCode, getClassByID } from "../ClassUtils";
import Whiteboard from "./Whiteboard";
import Header from "./Header";
import Draggable from "react-draggable";
import ChatContainer from "./ChatContainer";

// thank u guy from reddit for chat tutorial https://www.youtube.com/watch?v=LD7q0ZgvDs8

const Classroom = () => {
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const api_url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const [room, createRoom] = useState(undefined);
    // eslint-disable-next-line
    const [name, setName] = useState("");
    const [editMode, setEditMode] = useState(false)
    const [roomURL, setRoomURL] = useState("")
    const [user, setCurrentUser] = useState(null);
    // eslint-disable-next-line
    const [isOwner, setIsOwner] = useState(false);
    const [elements, setElements] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [newComponentName, setNewComponentName] = useState("whiteboard")
    const { TAid } = useParams();
    const currentToken = localStorage.getItem("token");
    // const isOwner = currentUser._id === TAid; // Determine if current user is the owner of the classroom
    const [isLoading, setIsLoading] = useState(true);
    // const [roomOnline, setOnline] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        if (currentToken && !user) {
            getCurrentUser().then(user => {
                const u = user.data.user
                setCurrentUser(u)
                setName(u.firstName + " " + u.lastName)
                if (u._id === TAid) {
                    setIsOwner(true)
                }
            })
            if (elements.length === 0) {
                getClassroomComponents(TAid).then(components => {
                    console.log(components)
                    setElements(components)
                })
            }
        }
    }, [currentToken, api_url, TAid, user, elements.length]);

    useEffect(() => {
        console.log("Fetching TA's name...");
        findUser(TAid).then(TA => {
            if (TA === null) {
                console.log("TA was unable to be found")
            }
        }).catch(e => console.log(e))
    }, [TAid, elements]); // Dependency: TAid

    useEffect(() => {
        getAllUserHours(TAid).then(hours => {
            if (hours) {
                // setOHSchedule(hours);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log("TA's office hours data is missing");
            }
        }).catch((error) => {
            console.log("Error getting TA document:", error);
        });
    }, [TAid]); // Dependencies: classId and TAid

    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 10 + "." + Date.now();
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} />);
    };

    const getNewUrl = (roomOwner) => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
        }
        axios.post(api_url + "/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "Authorization": "Bearer " + token,
                "content-type": "application/json",
                "ngrok-skip-browser-warning": true
            },
        }).then((res) => {
            if (res.data.url !== "") {
                setRoomURL(res.data.url);
            }
        }).catch(e => {
            console.log(e);
        });
    };

    const findElement = (elementName) => {
        for (var i in elements) {
            if (elements[i].name === elementName) {
                return elements[i]
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
                    </svg>
                </div>
            </div>
        );
    }


    let render;
    if (isOwner === false) {
        if (roomURL) {
            render = <NewRoom roomName="asdf" type="asdf" URL={roomURL} />;
        }
        else {
            getNewUrl(TAid);
            if (!roomURL) {
                render = <div className="rounded-lg shadow-md p-8 bg-indigo-200 my-10">! There is currently no one online.</div>
            }
        }
    }
    else {
        render = room ? room : (
            <div className="flex justify-center space-x-4">
                {/* Classroom Name Form Card */}
                <div className="flex-1 rounded-lg shadow-md p-8 bg-indigo-200">
                    <form onSubmit={handleSubmit} className="text-center">
                        <label htmlFor="roomtype" className="block mb-4 font-bold">What would you like to name your room?</label>
                        <input id="roomtype" type="text" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
                    </form>
                </div>
            </div>
        )

    }
// FIXME after 2nd whiteboard added, first becomes undraggable?
    const handleDrag = (e) => {
        console.log(elements)
        const element = e.target
        const rectangle = element.getBoundingClientRect()
        const x = rectangle.x
        const y = rectangle.y
        console.log(x, y)
        const widgetName = element.id.substring(0, element.id.indexOf("handle"))
        console.log(widgetName, elements)
        const targetElement = findElement(widgetName)
        if (targetElement) {
            console.log("MOVED: x:", targetElement.x - x, "y:", targetElement.y - y)
            targetElement.x = x
            targetElement.y = y
            console.log(elements)
        }
    }

    const saveElements = () => {
        setClassroomComponents(elements).then(_ => {
            // window.location.reload()
        }).catch(e => console.log(e))
    }

    const removeFromArray = (elementToRemove) => {
        const newArray = []
        for (var i in elements) {
            if (elements[i].name !== elementToRemove) {
                newArray.push(elements[i])
            }
        }
        setElements(newArray)
    }

    const handleAdd = () => {
        addClassroomComponent(newComponentName, 200, 200, 500, 500).then(result => {
            console.log(result)
            if(result !== null) {
                // window.location.reload()
                console.log(elements)
                const oldElements = [...elements]
                oldElements.push(result)
                setElements(oldElements)
                console.log(elements, oldElements)
                return true
            }
            else {
                console.log("An error occured")
                return false
            }
        }).catch(e => console.log(e))
    }

    const handleDelete = (e) => {
        removeFromArray(e.target.id)
        saveElements()
    }
    return (
        <div className="font-mono">
            <Header user={user} />
            {isOwner? <>
            <button className={`${ editMode ? "bg-indigo-500 text-white hover:bg-indigo-700" : "bg-indigo-200" } hover:bg-indigo-300 rounded-lg shadow-md p-2 my-2 mx-5`} onClick={() => {
                if(editMode === true) {
                    saveElements()
                }
                setEditMode(!editMode)
            }}> { editMode === true ? "save changes" : "edit classroom" }</button>
            <br></br>
            {editMode === true ? <button onClick={() => {
                setShowDropdown(!showDropdown)
            }}> 
                 {showDropdown ? 
                    <div className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5">
                    x   
                    {/* <label for="dropdown">  Select a new element:  </label> */}
                    </div>
                    :
                    <div className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5">
                        + add widget
                    </div >

                 }
            </button> : <></> }
            {showDropdown ? 
                <span className="">
                    <select className="mx-3" name="components" id="select-components" onChange={(e)=>{
                            setNewComponentName(e.target.value)
                    }}>
                        <option value="whiteboard">Whiteboard</option>
                        <option value="videocall">Video Call</option>
                        <option value="chat">Text Chat</option>
                    </select>
                    <button className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5 w-fit" onClick={()=>{
                        console.log("adding", newComponentName, "to user classroom")
                        handleAdd()
                        // if(result === true) this.forceUpdate()
                    }}> add</button>
                </span>
                : <></>}
            </> : <></>}
                {
                    // console.log(elements)
                    elements.map((element) => {
                        console.log(element)
                        if(element.name.indexOf("whiteboard") >= 0) {
                            return <div style={{position: "absolute", "top": element.y + "px", "left": element.x + "px"}}>
                                {editMode && isOwner ? <Draggable grid={[20,20]} handle={`#${element.name}handle`} onStop={handleDrag} key="whiteboard">
                                <div>
                                    <button onClick={handleDelete} id={element.name}> Remove </button>
                                    <div id={`${element.name}handle`} className="cursor-move bg-gray-500 p-3"> 
                                    </div>
                                    <Whiteboard width={element.width} height={element.height} />
                                </div>
                                </Draggable> : <Whiteboard width={element.width} height={element.height} />}
                            </div>
                        }
                        else if(element.name.indexOf("chat") >= 0) {
                            return <div style={{ position: "absolute", "top": element.y + "px", "left": element.x + "px" }}>
                                {editMode && isOwner ? <Draggable grid={[20, 20]} handle={`#${element.name}handle`} onStop={handleDrag} key="chat">
                                    <div>
                                        <button onClick={handleDelete} id={element.name}> Remove </button>
                                        <div id={`${element.name}handle`} className="cursor-move bg-gray-500 p-3">
                                        </div>
                                        <ChatContainer />
                                    </div>
                                </Draggable> 
                                : 
                                <ChatContainer />
                                }
                            </div>
                        }
                        else {
                            return <div style={{position: "absolute", "top": element.y + "px", "left": element.x + "px"}}>
                             {editMode && isOwner ? <Draggable grid={[20,20]} handle={`#${element.name}handle`} onStop={handleDrag} key="handle">
                                <div>
                                    <button onClick={handleDelete} id={element.name}> Remove </button>
                                    <div id={`${element.name}handle`} className="cursor-move bg-gray-500 p-3"> 
                                    </div>
                                    {render}
                                </div>
                                </Draggable> : render}
                            </div>
                        }
                    })
                }
            </div>

    );
}

export default Classroom;