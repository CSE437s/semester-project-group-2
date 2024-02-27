import { useState, useEffect } from "react";
import LogoutButton from './LogoutButton';
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NewRoom from "./NewRoom";
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import OHschedule from "./OHSchedule";

const Classroom = () => {
    const DEBUGGING = false;
    const base_url = "https://carefully-certain-swift.ngrok-free.app";
    const debugging_url = "http://localhost:3001";
    const api_url = DEBUGGING ? debugging_url : base_url;
    const [room, createRoom] = useState(undefined);
    // eslint-disable-next-line
    const [name, setName] = useState("");
    const [roomURL, setRoomURL] = useState("");
    const [schedule, setOHSchedule] = useState({ days: [], start: '', end: '' });
    const { classId, TAid } = useParams();
    const [taName, setTaName] = useState(""); // State to store TA's name
    const currentUser = localStorage.getItem("userID");
    const isOwner = currentUser === TAid; // Determine if current user is the owner of the classroom
    const [isLoading, setIsLoading] = useState(true);
    const [roomOnline, setOnline] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser);
            if (userDocRef) {
                getDoc(userDocRef).then((d) => {
                    const docData = d.data();
                    setName(docData.email);
                }).catch((error) => {
                    console.log(error);
                });
            }
        }
    }, [currentUser]);

    useEffect(() => {
        console.log("Fetching TA's name...");
        const taDocRef = doc(db, "users", TAid); // Assuming TA information is stored in "users" collection

        getDoc(taDocRef)
            .then((taDoc) => {
                if (taDoc.exists()) {
                    const taData = taDoc.data();
                    setTaName(taData.firstName); // Assuming TA's name is stored in "name" field
                } else {
                    console.log("TA document does not exist");
                }
            })
            .catch((error) => {
                console.log("Error getting TA document:", error);
            });
    }, [TAid]); // Dependency: TAid

    useEffect(() => {
        console.log("looking for hours...");
        const taRef = doc(db, "classes", classId, "TAs", TAid);

        if (!taRef) {
            console.log("Cannot find TA document with that TA ID");
            return;
        }

        getDoc(taRef)
            .then((taDoc) => {
                if (taDoc.exists()) {
                    const taData = taDoc.data();

                    if (taData.OHtimes) {
                        setOHSchedule(taData.OHtimes);
                        setIsLoading(false);
                    } else {
                        setIsLoading(false);
                        console.log("TA's office hours data is missing");
                    }
                } else {
                    console.log("TA document does not exist");
                }
            })
            .catch((error) => {
                console.log("Error getting TA document:", error);
            });

    }, [classId, TAid]); // Dependencies: classId and TAid

    const handleSubmit = (e) => {
        setOnline(true)
        const newRoomName = Math.random() * 1000 + "." + Date.now();
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} />);
    };

    const getNewUrl = (roomOwner) => {
        axios.post(api_url + "/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "content-type": "application/json",
            },
        }).then((res) => {
            setRoomURL(res.data.url);
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

    const sendTimeInformation = (e) => {
        e.preventDefault();
        const start_time = e.target.start_time.value;
        const end_time = e.target.end_time.value;

        const userRef = doc(db, "classes", classId, "TAs", currentUser);

        if (!userRef) {
            console.log("cannot find user document with that user ID");
        }

        setDoc(userRef, {
            OHtimes: {
                days: dates,
                start: start_time,
                end: end_time
            }
        }, { merge: true }).then(() => {
            console.log("successfully updated office hours schedule");
            window.location.reload();
        }).catch(e => console.log(e));
        // TODO after MVP, move API requests to backend/
        // axios.post("/api/updateOHTime", officeHours, {
        //     headers: {
        //         "content-type": "application/json"
        //     }
        // }).then(() => {
        //     console.log("sent!")
        // }).catch((res) => {
        //     console.log(res)
        //     if(res.response.status === 404) {
        //         console.log("!! ERROR: user not found" + res.error)
        //     }
        //     else if (res.response.status === 400) {
        //         console.log("!! ERROR:", res.systemerror)
        //     }
        // })
        dates = [];
    };

    let render;

    if (isOwner === false) {
        if(roomOnline === false) {
            render = <div className="rounded-lg shadow-md p-8 bg-indigo-200 my-10">! There is currently no one online.</div>
        }
        else {
            if (roomURL) {
                render = <NewRoom roomName="asdf" type="asdf" URL={roomURL} />;
            }
            else {
                getNewUrl(TAid);
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

                {/* Time Information Form Card */}
                <div className="flex-1 justify-center rounded-lg shadow-md p-8 bg-indigo-200" >
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
            </div>
        );
    }

    return (
        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-between items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                    <div>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/me")}
                        >
                            My Profile
                        </button>

                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center mb-4">{isOwner ? "Your Classroom" : `${taName}'s Classroom!`}</h1>
                {render}
                {schedule.days ? <OHschedule dates={schedule.days} start={schedule.start} end={schedule.end} /> : <></>}
            </div>
        </div>
    );
}

export default Classroom;