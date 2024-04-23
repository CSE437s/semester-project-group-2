import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, getAllUserHours, getClassroomComponents, setClassroomComponents, addClassroomComponent, getClassroomSettings, getCurrentStudent, removeCurrentStudent } from "../UserUtils";
import Header from "./Header";
import Moveable from "./Moveable";
import ClassroomSettings from "./ClassroomSettings";
import Queue from "./Queue";
// thank u guy from reddit for chat tutorial https://www.youtube.com/watch?v=LD7q0ZgvDs8

const Classroom = () => {
    const [editMode, setEditMode] = useState(false)
    const [user, setCurrentUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [elements, setElements] = useState()
    const [settings, setSettings] = useState()
    const [newComponentName, setNewComponentName] = useState("whiteboard")
    const { TAid } = useParams();
    const currentToken = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate()

    const saveElements = () => {
        setClassroomComponents(elements).then(_ => {
        }).catch(e => console.log(e))
    }

    // classroom settings useEffect
    useEffect(() => {
        const getInfo = async () => {
            const sett = await getClassroomSettings(TAid)
            if(!settings) {
                setSettings(sett)
            }
            if(sett === null) {
                navigate("/login")
                return
            }
            if (currentToken && !user) {
                const user = await getCurrentUser()
                const u = user.data.user
                setCurrentUser(u)
                const student = await getCurrentStudent(TAid)
                if (u._id === TAid) {
                    setIsOwner(true)
                }
                if(sett) {
                    if(sett.queueEnabled === true && u._id !== TAid && (student === null || u._id !== student._id)) {
                        if(sett.instructorsAllowed === false && u.role === "instructor"){ // capture special case of instructors 
                            navigate(`/classrooms/waiting/${TAid}`)
                        }
                    }
                }
            }
            if (!elements) {
                const components = await getClassroomComponents(TAid)
                if(components === null) {
                    navigate("/login")
                    return
                }
                setElements(components)
            }
        }
        getInfo()
        return () => {
            if(user?._id !== TAid && settings?.queueEnabled === true ) {
                console.log("dismount moment")
                removeCurrentStudent(TAid).then(result => {
                    console.log(result)
                })
            }
        }
        //eslint-disable-next-line
    }, [settings]) // rerun when settings are changed

    // save elements on elements change useEffect
    useEffect(() => {
        if(elements) {
            saveElements()
        }
        //eslint-disable-next-line
    }, [elements])

    // get hours useEffect
    useEffect(() => {
        const userPromise = getAllUserHours(TAid)
        if(userPromise === null) {
            navigate("/login")
            return
        }
        userPromise.then(hours => {
            if (hours) {
                // setOHSchedule(hours);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log("TA's office hours data is missing");
            }
        }).catch((error) => {
            console.log("Error getting TA document:", error);
            setIsLoading(false)
        });
        //eslint-disable-next-line
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
            console.log(newComponent)
            console.log(newComponent)
            const newarray = [...elements]
            newarray.push(newComponent)
            setElements(newarray)
            
        }).catch(e => console.log(e))
    }

    const handleDelete = (elementName) => {
        console.log('removing', elementName)
        const newElements = elements.filter((element) => element.name !== elementName)
        console.log(newElements)
        setElements([...newElements])
    }
    return (
        <div className="font-mono bg-indigo-50 h-dvh text-gray-800">
            <Header user={user} />
            <div id="classroom">
                { isOwner === true && <span  className="z-10 absolute right-0"><ClassroomSettings /></span>}
                { isOwner? <>
                <button className={`${ editMode ? "bg-indigo-500 text-white hover:bg-indigo-700" : "bg-indigo-200" } hover:bg-indigo-300 rounded-lg shadow-md p-2 my-2 mx-5`} onClick={() => {
                    if(editMode === true) {
                        saveElements()
                    }
                    setEditMode(!editMode)
                }}> { editMode === true ? "done" : "manage widgets" }</button>
                { editMode === true && <button className="bg-indigo-100 hover:bg-indigo-300 rounded-lg shadow-md p-2 my-2 mx-5" onClick={()=> setElements([])} > remove all </button> }
                <br></br>
                {editMode === true ? <span className="">
                        <select className="mx-5" name="components" id="select-components" onChange={(e)=>{
                                setNewComponentName(e.target.value)
                        }}>
                            <option value="whiteboard">Whiteboard</option>
                            <option value="videocall">Video Call</option>
                            <option value="chat">Text Chat</option>
                            <option value="code">Code Editor</option>
                        </select>
                        <button className="hover:bg-indigo-300 rounded-lg shadow-md p-2 bg-indigo-200 my-2 mx-5 w-fit" onClick={()=>{
                            handleAdd(newComponentName)
                        }}> + add </button>
                        <br />
                    </span> : <></> 
                }</>
                : <></>
                }
                <div className="mx-5 my-10">
                    { isOwner === true && settings?.queueEnabled === true && <Queue /> }
                </div>
                {
                    elements && 
                    elements.map((element) => {
                        if(!element || element === null || !element.name) {
                            console.log("no such element")
                            return <></>
                        }
                        else if(element.name.indexOf("whiteboard") >= 0) {
                            return <>
                            <Moveable
                                key={element.name}
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
                                deleteButton={<button className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                                    handleDelete(element.name)
                                }}>Remove</button>}
                                >
                            </Moveable>
                            </>
                        }
                        else if(element.name.indexOf("chat") >= 0) {
                            return <Moveable
                                key={element.name}
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
                                deleteButton={<button className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                                    handleDelete(element.name)
                                }}>Remove</button>}
                                >
                        </Moveable>
                        }
                        else if(element.name.indexOf("code") >= 0) {
                            return <Moveable
                                key={element.name}
                                width={element.width}
                                height={element.height}
                                initialX={element.x}
                                initialY={element.y}
                                component="code"
                                movingStop={(newX, newY) => {
                                    handleDrag(newX, newY, element.name)
                                }}
                                resizingStop={(size)=>{
                                    handleResize(element, size)
                                }}
                                isOwner={isOwner}
                                deleteButton={<button className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                                    handleDelete(element.name)
                                }}>Remove</button>}
                                lang="java"
                                theme="github"
                                >
                        </Moveable>
                        }
                        else {
                            return <Moveable
                            key={element.name}
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
                            deleteButton={<button className="px-2 text-sm hover:cursor-pointer" onClick={() => {
                                handleDelete(element.name)
                            }}>Remove</button>}
                            >
                        </Moveable>

                        }
                    })
                }
            </div>
        </div>

    );
}

export default Classroom;