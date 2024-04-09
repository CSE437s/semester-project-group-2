import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getCurrentUser, findUser, getAllUserHours, getClassroomComponents, setClassroomComponents, addClassroomComponent } from "../UserUtils";
import Header from "./Header";
import Moveable from "./Moveable";

// thank u guy from reddit for chat tutorial https://www.youtube.com/watch?v=LD7q0ZgvDs8

const Classroom = () => {
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const x = 5;
    const api_url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const [editMode, setEditMode] = useState(false)
    const [user, setCurrentUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [elements, setElements] = useState()
    const { TAid } = useParams();
    const currentToken = localStorage.getItem("token");
    const [isLoading, setIsLoading] = useState(true);

    const [featureState, setFeatureState] = useState({
        whiteboard: false,
        videocall: false,
        chat: false
    });

    const toggleFeature = (feature) => {
        setFeatureState(prev => {
            const isFeatureActive = !prev[feature];
            if (isFeatureActive) {
                handleAdd(feature); 
            } else {
                handleDelete(feature);
            }
            return { ...prev, [feature]: isFeatureActive };
        });
    };

    //eslint-disable-next-line
    const saveElements = () => {
        setClassroomComponents(elements).then(_ => {
            // window.location.reload()
        }).catch(e => console.log(e))
    }

    useEffect(() => {
        if (Array.isArray(elements)) {
            let newFeatureState = {
                whiteboard: elements.some(element => element.name && element.name.includes('whiteboard')),
                videocall: elements.some(element => element.name && element.name === 'videocall'),
                chat: elements.some(element => element.name && element.name === 'chat')
            };

            setFeatureState(newFeatureState);
        }
    }, [elements]);

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
    console.log(elements)

    useEffect(() => {
        if (elements) {
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
            setIsLoading(false)
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
        const HEADER_HEIGHT = 150;
        const newY = Math.max(y, HEADER_HEIGHT);
        if (targetElement) {

            targetElement.x = x
            targetElement.y = newY
            setClassroomComponents(elements).then(_ => {
                // window.location.reload()
            }).catch(e => console.log(e))
        }
        saveElements()
    }



    const handleAdd = (elementName) => {
        let defaultDimensions;
        const margin = 20;
        const innerWidth = window.innerWidth - margin * 4;
        const innerHeight = window.innerHeight - 150;

        const whiteboardWidth = Math.floor(innerWidth * 0.3);
        const videoCallWidth = Math.floor(innerWidth * 0.5);
        const chatWidth = Math.floor(innerWidth * 0.2);

        const whiteboardX = margin;
        const videoCallX = whiteboardX + whiteboardWidth + margin;
        const chatX = videoCallX + videoCallWidth + margin;

        switch (elementName) {
            case 'whiteboard':
                defaultDimensions = { x: whiteboardX, y: 150, width: whiteboardWidth, height: innerHeight };
                break;
            case 'videocall':
                defaultDimensions = { x: videoCallX, y: 150, width: videoCallWidth, height: innerHeight };
                break;
            case 'chat':
                defaultDimensions = { x: chatX, y: 150, width: chatWidth, height: innerHeight };
                break;
            default:
                defaultDimensions = { x: 100, y: 100, width: 300, height: 300 };
        }

        addClassroomComponent(elementName, defaultDimensions.x, defaultDimensions.y, defaultDimensions.width, defaultDimensions.height).then(newComponent => {
            const newElements = [...elements, newComponent];
            setElements(newElements);
        }).catch(e => console.error('Error adding component:', e));
    }

    const handleDelete = (elementName) => {
        console.log('removing', elementName);
        const newElements = elements.filter((element) => element.name !== elementName);
        console.log(newElements);
        setElements(newElements);
    };
    return (
        <div className="font-mono">
            <Header user={user} />
            {isOwner && (
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
                    <div className="flex items-center justify-start space-x-4">
                        <button
                            className={`p-2 ${editMode ? "text-white bg-indigo-600" : "text-indigo-600 bg-transparent"} hover:bg-indigo-500 rounded`}
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? (
                                <>
                                    <i className="fas fa-save mr-2"></i>
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-edit mr-2"></i>
                                    Edit Mode
                                </>
                            )}
                        </button>
                        {/* Similar structure for the other buttons */}
                        <button
                            className={`p-2 ${featureState.whiteboard ? "text-white bg-indigo-600" : "text-indigo-600 bg-transparent"} hover:bg-indigo-500 rounded`}
                            onClick={() => toggleFeature('whiteboard')}
                        >
                            <i className={`mr-2 fas ${featureState.whiteboard ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            Whiteboard
                        </button>
                        <button
                            className={`p-2 ${featureState.videocall ? "text-white bg-indigo-600" : "text-indigo-600 bg-transparent"} hover:bg-indigo-500 rounded`}
                            onClick={() => toggleFeature('videocall')}
                        >
                            <i className={`mr-2 fas ${featureState.videocall ? 'fa-video-slash' : 'fa-video'}`}></i>
                            Video Call
                        </button>
                        <button
                            className={`p-2 ${featureState.chat ? "text-white bg-indigo-600" : "text-indigo-600 bg-transparent"} hover:bg-indigo-500 rounded`}
                            onClick={() => toggleFeature('chat')}
                        >
                            <i className={`mr-2 fas ${featureState.chat ? 'fa-comments-slash' : 'fa-comments'}`}></i>
                            Text Chat
                        </button>
                    </div>
                </div>

            )}
            {
                elements &&
                elements.map((element, index) => {
                    if (!element || !element.name) {
                        console.log("no such element");
                        return null;
                    } else {
                        const key = `${element.name}-${index}`;
                        if (element.name.includes("whiteboard")) {
                            return (
                                <Moveable
                                    key={key}
                                    width={element.width}
                                    height={element.height}
                                    initialX={element.x}
                                    initialY={element.y}
                                    component="whiteboard"
                                    movingStop={(newX, newY) => {
                                        handleDrag(newX, newY, element.name);
                                    }}
                                    resizingStop={(size) => {
                                        handleResize(element, size);
                                    }}
                                    isOwner={isOwner}
                                />
                            );
                        } else if (element.name.includes("chat")) {
                            return (
                                <Moveable
                                    key={key}
                                    width={element.width}
                                    height={element.height}
                                    initialX={element.x}
                                    initialY={element.y}
                                    component="chat"
                                    movingStop={(newX, newY) => {
                                        handleDrag(newX, newY, element.name);
                                    }}
                                    resizingStop={(size) => {
                                        handleResize(element, size);
                                    }}
                                    isOwner={isOwner}
                                />
                            );
                        } else if (element.name.includes("video")) {
                            return (
                                <Moveable
                                    key={key}
                                    width={element.width}
                                    height={element.height}
                                    initialX={element.x}
                                    initialY={element.y}
                                    component="video"
                                    movingStop={(newX, newY) => {
                                        handleDrag(newX, newY, element.name);
                                    }}
                                    resizingStop={(size) => {
                                        handleResize(element, size);
                                    }}
                                    isOwner={isOwner}
                                />
                            );
                        } else {
                            return null;
                        }
                    }
                })
            }

        </div>

    );
}

export default Classroom;
