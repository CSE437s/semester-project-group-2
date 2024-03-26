import { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from "../UserUtils";


const Header = (props) => {
    const [hasClassroom, setHasClassroom] = useState();
    const [userId, setId] = useState();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const { pathname } = window.location;
        // only run this if on dashboard-- was messing up the ability to use the header component on other pages TODO fix
        // if (pathname === '/dashboard') {
            var user = props.user;
            if(!user) {
                const token = localStorage.getItem("token")
                if(token) {
                    getCurrentUser().then(u => {
                        user = u.data.user
                        console.log(user)
                        setId(user._id)
                    }).catch(e => console.log(e))
                }
                else {
                    navigate("/login")
                }
            }
            else {
                setId(user._id);
                if (user.classesAsTA.length > 0 || user.classesAsInstructor.length > 0) {
                    setHasClassroom(true);
                }
            }
        // }
    }, [props.user]);
    return (
        <header className="bg-indigo-300 p-0 py-5 z-10">

            <div className="container flex justify-between items-center max-w-full">
                <Link to="/home">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                        <h1 className="text-3xl font-bold text-black font-mono">ONLINE OH</h1>
                    </div>
                </Link>

                {/* hamburgie menu */}
                <div className="lg:hidden font-mono">
                    <div className="HAMBURGER-ICON space-y-2 mr-10" onClick={() => setIsNavOpen((prev) => !prev)}>
                        <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
                        <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
                        <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
                    </div>

                    {isNavOpen && (
                        <div className="MOBILE-MENU absolute top-0 right-0 px-8 py-8 bg-white font-mono">
                            <div className="CROSS-ICON" onClick={() => setIsNavOpen(false)}>
                                <svg
                                    className="h-8 w-8 text-gray-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </div>
                            <ul className="flex flex-col items-center justify-between min-h-[250px]">
                                <li className="border-b border-gray-400 my-8 uppercase">
                                    <a href="/dashboard">Dashboard</a>
                                </li>
                                <li className="border-b border-gray-400 my-8 uppercase">
                                    <a href="/me">My Profile</a>
                                </li>
                                {hasClassroom && (
                                    <li className="border-b border-gray-400 my-8 uppercase">
                                        <a href={`/classrooms/${userId}`}>My Classroom</a>
                                    </li>
                                )}
                                <li className="border-b border-gray-400 my-8 uppercase">
                                    <LogoutButton />
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
                
                {/* normal menu */}

                <nav className="hidden lg:flex mr-10">
                    <div>
                        {hasClassroom && window.location.href.indexOf("classrooms") < 0 ?
                            <button
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                                onClick={() => navigate("/classrooms/" + userId)}
                            >
                                My Classroom
                            </button>
                            : <>{hasClassroom}</>
                        }

                    </div>
                    {
                        window.location.href.indexOf("dashboard") < 0 ?
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                        :
                        <></>
                    }
                    {
                        window.location.href.indexOf("me") < 0 ?
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/me")}
                        >
                            My Profile
                        </button>
                        :
                        <></>
                    }

                    <LogoutButton />


                </nav>
            </div>
        </header>
    );
};

export default Header;