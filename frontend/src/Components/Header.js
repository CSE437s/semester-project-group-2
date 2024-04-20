import { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from "../UserUtils";

const Header = (props) => {
    const [hasClassroom, setHasClassroom] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!props.user) {
            const token = localStorage.getItem("token")
            if (token) {
                getCurrentUser()
                    .then(u => {
                        setUserId(u.data.user._id);
                        if (u.data.user.classesAsTA.length > 0 || u.data.user.classesAsInstructor.length > 0) {
                            setHasClassroom(true);
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        navigate("/login");
                    });
            } else {
                navigate("/login");
            }
        } else {
            setUserId(props.user._id);
            if (props.user.classesAsTA.length > 0 || props.user.classesAsInstructor.length > 0) {
                setHasClassroom(true);
            }
        }
    }, [props.user, navigate]);

    return (
        <div>
            <header className="bg-indigo-50 p-0 py-5 z-10">
                <div className="container flex justify-between items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                            <h1 className="text-3xl font-bold text-gray-900 font-mono">ONLINE OFFICE HOURS</h1> 
                            {/* deeply sorry but the OH abbreviation was driving me crazy */}
                        </div>
                    </Link>

                    {/* Hamburger menu */}
                    <div className="lg:hidden font-mono z-10">
                        <button
                            className="HAMBURGER-ICON focus:outline-non mr-10 flex items-center"
                            onClick={() => setIsNavOpen(prev => !prev)}
                        >
                            <svg
                            
                                className="h-8 w-8 text-gray-600 flex items-center"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                className="h-10 w-10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {isNavOpen && (
                            <div className="MOBILE-MENU absolute top-0 right-0 bg-white z-20 shadow-md p-4 rounded-md">
                                <div className="flex items-center justify-between mb-4">
                            
                                    <button
                                        className="CLOSE-ICON focus:outline-none"
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <svg
                                            className="h-6 w-6 text-gray-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <ul className="flex flex-col space-y-4">
                                    <li>
                                        <Link to="/dashboard" className="text-gray-800 hover:text-gray-600">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/me" className="text-gray-800 hover:text-gray-600">
                                            My Profile
                                        </Link>
                                    </li>
                                    {hasClassroom && (
                                        <li>
                                            <Link to={`/classrooms/${userId}`} className="text-gray-800 hover:text-gray-600">
                                                My Classroom
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <LogoutButton />
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Normal menu */}
                    <nav className="hidden lg:flex mr-10">
                        {hasClassroom && window.location.href.indexOf("classrooms") < 0 && (
                            <button
                                className="text-gray-800 font-bold py-2 mr-10 rounded hover:text-gray-600"
                                onClick={() => navigate("/classrooms/" + userId)}
                            >
                                My Classroom
                            </button>
                        )}
                        {window.location.href.indexOf("dashboard") < 0 && (
                            <button
                                className="text-gray-800 font-bold mr-10 rounded hover:text-gray-600"
                                onClick={() => navigate("/dashboard")}
                            >
                                Back to Classes
                            </button>
                        )}
                        {window.location.href.indexOf("me") < 0 && (
                            <button
                                className="text-gray-800 font-bold py-2 mr-10 rounded hover:text-gray-700"
                                onClick={() => navigate("/me")}
                            >
                                My Profile
                            </button>
                        )}
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <div className="border-0.5 border-gray-800 border-solid relative"></div>
        </div>
    );
};

export default Header;
