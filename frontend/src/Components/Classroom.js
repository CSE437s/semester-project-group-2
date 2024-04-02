import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getCurrentUser, findUser, getAllUserHours, getClassroomComponents, setClassroomComponents, addClassroomComponent } from "../UserUtils";
import Header from "./Header";
import Moveable from "./Moveable";

// thank u guy from reddit for chat tutorial https://www.youtube.com/watch?v=LD7q0ZgvDs8

const Classroom = () => {
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const api_url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const [editMode, setEditMode] = useState(false)
    const [user, setCurrentUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [elements, setElements] = useState()
    const [newComponentName, setNewComponentName] = useState("whiteboard")
    const { TAid } = useParams();
    const currentToken = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);
    //eslint-disable-next-line
    const saveElements = () => {
        setClassroomComponents(elements).then(_ => {
            // window.location.reload()
        }).catch(e => console.log(e))
    }

    useEffect(() => {
        if (currentToken && !user) {
            getCurrentUser().then(user => {
                const u = user.data.user
                setCurrentUser(u)
                if (u._id === TAid) {
                    setIsOwner(true)
                }
            })
            if (!elements) {
                getClassroomComponents(TAid).then(components => {
                    setElements(components)
                })
            }
        }
    }, [currentToken, api_url, TAid, user, elements]);

    useEffect(() => {
        if(elements) {
            saveElements()
        }
    }, [elements, saveElements])
    useEffect(() => {
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

    const handleResize = (element, newSize) => {
        const elementToChange = findElement(element.name)
        elementToChange.width = newSize.width
        elementToChange.height = newSize.height
        setClassroomComponents(elements).then(_ => {
            // window.location.reload()
        }).catch(e => console.log(e))
    }

    const handleDrag = (x, y, elementName) => {
        const widgetName = elementName
        const targetElement = findElement(widgetName)
        if (targetElement) {

            targetElement.x = x
            targetElement.y = y
            setClassroomComponents(elements).then(_ => {
                // window.location.reload()
            }).catch(e => console.log(e))
        }
        saveElements()
    }

    

    const handleAdd = (elementName) => {
        addClassroomComponent(elementName, 100, 100, 300, 300).then(newComponent => {
            if(newComponent) {
                console.log(newComponent)
                const newarray = [...elements]
                newarray.push(newComponent)
                setElements(newarray)
            }
            
        }).catch(e => console.log(e))
    }

    const handleDelete = (elementName) => {
        console.log('removing', elementName)
        const newElements = elements.filter((element) => element.name !== elementName)
        console.log(newElements)
        setElements([...newElements])
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
            }}> { editMode === true ? "save changes" : "add widgets" }</button>
            <br></br>
            {editMode === true ? <span className="">
                    <select className="mx-3" name="components" id="select-components" onChange={(e)=>{
                            setNewComponentName(e.target.value)
                    }}>
                        <option value="whiteboard">Whiteboard</option>
                        <option value="videocall">Video Call</option>
                        <option value="chat">Text Chat</option>
                    </select>
                    <button className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5 w-fit" onClick={()=>{
                        handleAdd(newComponentName)
                    }}> add</button>
                </span> : <></> 
            }</>
            : <></>
            }
            {console.log(elements)}
            {
                elements.map((element) => {
                    if(element.name.indexOf("whiteboard") >= 0) {
                        return <>
                        <Moveable
                            width={element.width}
                            height={element.height}
                            initialX={element.x}
                            initialY={element.y}
                            component="whiteboard"
                            movingStop={(newX, newY) => {
                                handleDrag(newX, newY, element.name)
                            }}
                            resizingStop={(size)=>{
                                handleResize(element, size)
                            }}
                            isOwner={isOwner}
                            deleteButton={<buttton className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                                handleDelete(element.name)
                            }}>Remove</buttton>}
                            >
                        </Moveable>
                        </>
                    }
                    else if(element.name.indexOf("chat") >= 0) {
                        return <Moveable
                        width={element.width}
                        height={element.height}
                        initialX={element.x}
                        initialY={element.y}
                        component="chat"
                        movingStop={(newX, newY) => {
                            handleDrag(newX, newY, element.name)
                        }}
                        resizingStop={(size)=>{
                            handleResize(element, size)
                        }}
                        isOwner={isOwner}
                        deleteButton={<buttton className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                            handleDelete(element.name)
                        }}>Remove</buttton>}
                        >
                    </Moveable>
                    }
                    else {
                        return <Moveable
                        width={element.width}
                        height={element.height}
                        initialX={element.x}
                        initialY={element.y}
                        component="video"
                        movingStop={(newX, newY) => {
                            handleDrag(newX, newY, element.name)
                        }}
                        resizingStop={(size)=>{
                            handleResize(element, size)
                        }}
                        isOwner={isOwner}
                        deleteButton={<buttton className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                            handleDelete(element.name)
                        }}>Remove</buttton>}
                        >
                    </Moveable>

                    }
                })
            }
        </div>

    );
}

export default Classroom;