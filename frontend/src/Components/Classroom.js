import { useState, useEffect } from "react"
import LogoutButton from './LogoutButton';
import { db } from "../firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import NewRoom from "./NewRoom"
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "axios"
import OHschedule from "./OHSchedule"

const Classroom = () => {
    const DEBUGGING = false
    const base_url = "http://sweworkshop.us-east-2.elasticbeanstalk.com"
    const debugging_url = "http://localhost:3001"
    const api_url = DEBUGGING ? debugging_url : base_url
    const [room, createRoom] = useState(undefined)
    const [name, setName] = useState("")
    const [roomURL, setRoomURL] = useState("")
    const [schedule, setOHSchedule] = useState({ days: [], start: '', end: '' });
    const { classId, TAid } = useParams();
    const [taName, setTaName] = useState(""); // State to store TA's name
    const currentUser = localStorage.getItem("userID")

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser);
            if (userDocRef) {
                getDoc(userDocRef).then((d) => {
                    const docData = d.data()
                    setName(docData.email)
                }).catch((error) => {
                    console.log(error)
                })
            }
        }
    }, [currentUser])

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
                    } else {
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

    const isOwner = currentUser === TAid; // Determine if current user is the owner of the classroom

    const handleSubmit = (e) => {
        const newRoomName = Math.random() * 1000 + "." + Date.now()
        createRoom(<NewRoom roomName={newRoomName} type={e.target.roomtype.value} />)
    }

    const getNewUrl = (roomOwner) => {
        axios.post(api_url + "/api/getVideoURL", { "creator": roomOwner }, {
            headers: {
                "content-type": "application/json",
            },
        }).then((res) => {
            setRoomURL(res.data.url)
        }).catch(e => {
            console.log(e)
        })
    }

    var dates = []
    const removeElement = (element) => {
        const newDates = []
        for (var day in dates) {
            if (dates[day] !== element) {
                newDates.push(dates[day])
            }
        }
        dates = newDates
    }

    const handleDayPicker = (e) => {
        e.preventDefault()
        const day = e.target.value
        const color = e.target.style.backgroundColor
        if (color !== '' && color !== "white") { // deselecting
            e.target.style.backgroundColor = "white"
            removeElement(day)
        }
        else { //  selecting
            e.target.style.backgroundColor = "red"
            dates.push(day)
        }
        console.log(dates)
    }

    const sendTimeInformation = (e) => {
        e.preventDefault()
        const start_time = e.target.start_time.value
        const end_time = e.target.end_time.value

        const userRef = doc(db, "classes", classId, "TAs", currentUser);

        if (!userRef) {
            console.log("cannot find user document with that user ID")
        }

        setDoc(userRef, {
            OHtimes: {
                days: dates,
                start: start_time,
                end: end_time
            }
        }, { merge: true }).then(() => {
            console.log("successfully updated office hours schedule")
            window.location.reload()
        }).catch(e => console.log(e))
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
        dates = []
    }

    let render;

    if (isOwner === false) {
        if (roomURL) {
            render = <NewRoom roomName="asdf" type="asdf" URL={roomURL} />
        }
        else {
            getNewUrl(TAid)
        }
    }
    else {
        render = room ? room : (
            <>
                <form onSubmit={handleSubmit} className="text-center">
                    <label htmlFor="roomtype" className="block">What would you like to name your room?</label>
                    <input id="roomtype" type="text" className="border border-gray-300 rounded px-4 py-2 mt-2" />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
                </form>
                <form onSubmit={sendTimeInformation}>
                    <label>When would you like to host your office hours?</label>
                    <label>from</label>
                    <input type="time" name="start_time" />
                    <label>until</label>
                    <input type="time" name="end_time" />
                    <button onClick={handleDayPicker} value="M">M </button>
                    <button onClick={handleDayPicker} value="T">T </button>
                    <button onClick={handleDayPicker} value="W">W </button>
                    <button onClick={handleDayPicker} value="Th">Th </button>
                    <button onClick={handleDayPicker} value="F">F </button>
                    <button onClick={handleDayPicker} value="S">S </button>
                    <button onClick={handleDayPicker} value="Su">Su</button>
                    <button type="submit">Submit</button>
                </form>
            </>
        )
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
                <h1 className="text-2xl font-bold text-center mb-4">{isOwner ? "Welcome to your Classroom" : `Welcome to ${taName}'s Classroom!`}</h1>
                {render}
                {schedule.days ? <OHschedule dates={schedule.days} start={schedule.start} end={schedule.end} /> : <></>}
            </div>
        </div>
    )
}

export default Classroom
