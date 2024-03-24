import { useState, useEffect, useRef } from "react";
import LogoutButton from './LogoutButton';
import NewRoom from "./NewRoom";
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import OHschedule from "./OHSchedule";
import { getCurrentUser, findUser, getAllUserHours, addUserHours } from "../UserUtils";
// import { getClassByCode, getClassByID } from "../ClassUtils";
import Whiteboard from "./Whiteboard";
import Header from "./Header";
import Draggable, {DraggableCore} from "react-draggable";


const Classroom = () => {
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;
    const base_url = "https://carefully-certain-swift.ngrok-free.app";
    const debugging_url = "http://localhost:5050";
    const api_url = DEBUGGING ? debugging_url : base_url;
    const [room, createRoom] = useState(undefined);
    // eslint-disable-next-line
    const [name, setName] = useState("");
    const [editMode, setEditMode] = useState(false)
    const [roomURL, setRoomURL] = useState("")
    const [user, setCurrentUser] = useState(null);
    const [schedule, setOHSchedule] = useState({ days: [], start: '', end: '' });
    const [isOwner, setIsOwner] = useState(false);
    const whiteboardRef = useRef(null)
    const [elementsCoordinates, setElementsCoordinates] = useState([{ name: "Whiteboard", x: 0, y: 0}, {name: "VideoCall", x: 0, y:0}])
    const {  TAid } = useParams();
    const [taName, setTaName] = useState(""); // State to store TA's name
    const currentToken = localStorage.getItem("token");
    // const isOwner = currentUser._id === TAid; // Determine if current user is the owner of the classroom
    const [isLoading, setIsLoading] = useState(true);
    // const [roomOnline, setOnline] = useState(false)

    const navigate = useNavigate();


    const findCoordinates = (name) => {
        for(var i in elementsCoordinates) {
            if(elementsCoordinates[i].name === name) {
                return elementsCoordinates[i]
            }
        }
    }
    useEffect(() => {
        if (currentToken && !user) {
            getCurrentUser().then(user => {
                const u = user.data.user
                setCurrentUser(u)
                setName(u.firstName + " " + u.lastName)
                if(u._id === TAid) {
                    setIsOwner(true)
                }
            })
            // wipe any old calls on entering classroom
        }
        // if(user) {
        //     const data = {
        //         "creator": user._id,
        //         "url": ""
        //     }
        //     axios.post(api_url + "/api/sendVideoURL", data, {
        //         headers: {
        //             "content-type": "application/json",
        //             Authorization: "Bearer " + currentToken,
        //             "ngrok-skip-browser-warning": true
        //         },
        //     });
        // }
    }, [currentToken, api_url, TAid, user]);

    useEffect(() => {
        console.log("Fetching TA's name...");
        findUser(TAid).then(TA => {
            if(TA !== null) {
                setTaName(TA.firstName)
            }
            else {
                console.log("TA was unable to be found")
            }
        }).catch(e => console.log(e))
    }, [TAid]); // Dependency: TAid

    useEffect(() => {
        getAllUserHours(TAid).then(hours => {
            if (hours) {
                setOHSchedule(hours);
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
        const newRoomName = Math.random() * 1000 + "." + Date.now();
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} />);
    };

    const getNewUrl = (roomOwner) => {
        axios.post(api_url + "/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "content-type": "application/json",
                "ngrok-skip-browser-warning": true
            },
        }).then((res) => {
            if(res.data.url !== "") {
                setRoomURL(res.data.url);
            }
        }).catch(e => {
            console.log(e);
        });
    };
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

    var dates = [];
    const removeElement = (element) => {
        const newDates = [];
        for (var day in dates) {
            if (dates[day] !== element) {
                newDates.push(dates[day]);
            }
        }
        dates = newDates;
    };

    const handleDayPicker = (e) => {
        e.preventDefault();
        const day = e.target.value;
        const color = e.target.style.backgroundColor;
        if (color !== '' && color !== "") { // deselecting
            e.target.style.backgroundColor = "";
            removeElement(day);
        }
        else { //  selecting
            e.target.style.backgroundColor = "#818cf8";
            dates.push(day);
        }
        console.log(dates);
    };

    const sendTimeInformation =  async (e) => {
        e.preventDefault();
        const start_time = e.target.start_time.value;
        const end_time = e.target.end_time.value;
         for(var i in dates) {
            const date = dates[i]
            // figure out how to get class id if classroom is just for TA 
            // const status = await addUserHours(user._id, "", classId, {
            //     day: date,
            //     startTime: start_time,
            //     endTime: end_time
            // })
            // if(status === true) {
            //     alert("success")
            // }
            // else {
            //     alert("Something went wrong please try again")
            // }
        }
        dates = [];
    };

    let render;
    let timeCard;
    if (isOwner === false) {
        if (roomURL) {
            render = <NewRoom roomName="asdf" type="asdf" URL={roomURL} />;
        }
        else {
            getNewUrl(TAid);
            if(!roomURL) {
                render = <div className="rounded-lg shadow-md p-8 bg-indigo-200 my-10">! There is currently no one online.</div>
            }
        
            timeCard = <></>
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
        timeCard =  <div className="flex-1 justify-center rounded-lg shadow-md p-8 bg-indigo-200" >
            <form onSubmit={sendTimeInformation}>
                <label className="block mb-4 text-center font-bold">When would you like to host your office hours?</label>
                <div className="flex justify-between mb-4">
                    <label htmlFor="start_time" className="mr-2">from</label>
                    <select id="start_time" name="start_time">
                        <option value="08:00">8:00 AM</option>
                        <option value="08:30">8:30 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="09:30">9:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="14:30">2:30 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="16:30">4:30 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="17:30">5:30 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="19:30">7:30 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="20:30">8:30 PM</option>
                        <option value="21:00">9:00 PM</option>
                        <option value="21:30">9:30 PM</option>
                        <option value="22:00">10:00 PM</option>
                    </select>
                </div>
                <div className="flex justify-between mb-4">
                    <label htmlFor="end_time" className="mr-2">until</label>
                    <select id="end_time" name="end_time">
                        <option value="08:00">8:00 AM</option>
                        <option value="08:30">8:30 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="09:30">9:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="13:30">1:30 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="14:30">2:30 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="15:30">3:30 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="16:30">4:30 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="17:30">5:30 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="18:30">6:30 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="19:30">7:30 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="20:30">8:30 PM</option>
                        <option value="21:00">9:00 PM</option>
                        <option value="21:30">9:30 PM</option>
                        <option value="22:00">10:00 PM</option>
                    </select>
                </div>

                <div className="flex justify-center space-x-4">
                    <button onClick={handleDayPicker} value="M">M </button>
                    <button onClick={handleDayPicker} value="T">T </button>
                    <button onClick={handleDayPicker} value="W">W </button>
                    <button onClick={handleDayPicker} value="Th">Th </button>
                    <button onClick={handleDayPicker} value="F">F </button>
                    <button onClick={handleDayPicker} value="S">S </button>
                    <button onClick={handleDayPicker} value="Su">Su</button>
                </div>
                <div className="flex justify-center"> {/* Centered horizontally */}
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
                </div>
            </form>
        </div>
    }

    const handleDrag = (e) => {
        console.log(e)

    }
    return (
        <div className="font-mono">
            <Header user={user} />
            <button onClick={() => {
                setEditMode(!editMode)
            }}> { editMode === true ? "done" : "edit" }</button>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center mb-4">{isOwner ? "Your Classroom" : `${taName}'s Classroom!`}</h1>
                <Draggable 
                    defaultPosition={{x: 5, y: 5}}
                    // handle=".handle"
                    disabled={!editMode}
                    grid={[20, 20]}
                   
                > 
                    <div className="handle">
                        {render}
                    </div> 
                </Draggable>
                <Draggable  
                    defaultPosition={{x: 10, y:30}}
                    disabled={!editMode}
                    handle="#handle"
                    grid={[20, 20]}
                    onDrag={handleDrag}
                >
                    <div ref={whiteboardRef}>
                        <div id="handle" className="bg-gray-500 p-3 w-full">

                        </div>
                        <Whiteboard width={1000} height={500}/>
                    </div>
                </Draggable>
                {timeCard}
                {schedule.days ? <OHschedule dates={schedule.days} start={schedule.start} end={schedule.end} /> : <></>}
             </div>
        </div>
    );
}

export default Classroom;