import LogoutButton from "./LogoutButton"
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from "react";


const Header = (props) => {
    const [hasClassroom, setHasClassroom] = useState()
    const [userId, setId] = useState()
    const navigate = useNavigate()
    useEffect(() => {
        const user = props.user
        setId(user._id)
        if(user.classesAsTA.length > 0 || user.classesAsInstructor.length > 0) {
            setHasClassroom(true)
        }
    })
    return (
        <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-between items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                    <div>
                    <div>
                        {hasClassroom && window.location.href.indexOf("classrooms") < 0 ? 
                            <button
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                                onClick={() => navigate("/classrooms/" + userId)}
                            >
                                My Classroom
                            </button>
                            : <></>
                        }

                    </div>
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
    )
}

export default Header