import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios"
import { getUser } from '../UserUtils';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("student");
    const navigate = useNavigate();
    const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING_MODE ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"

    // const [checkingAuth, setCheckingAuth] = useState(true);

    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged(user => {
    //         setCheckingAuth(false);
    //         if (user) {
    //             navigate('/dashboard');
    //         }
    //     });
    //     return unsubscribe;
    // }, [navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        axios.post(url +"/api/signup", {
            "email": email,
            "password": password, 
            "firstName": firstName,
            "lastName": lastName,
            "role": role,
            "status": "approved" // TODO create approval system and remove hard coded value
        }, {
            headers: {
                "ngrok-skip-browser-warning": true
            }
        }).then((data) => {
            if(data.data.user) {
                getUser(email, password).then(res => {
                    if(!res.error) {
                        navigate("/dashboard")
                    }
                })
            }
            else if(data.error) {
                alert("something went wrong. please try again")
            }
        }).catch(e => console.log(e))
    };

    // if (checkingAuth) {
    //     return <div>Loading...</div>;
    // }


    return (
        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-center items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                </div>
            </header>
            <div className="flex justify-center mt-6 p-10 pb-4 ">
                <form onSubmit={handleSignup} className="shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-200">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                            Last Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                        <div className="flex items-center">
                            <input
                                className="mr-2 leading-tight"
                                type="radio"
                                value="student"
                                name="role"
                                checked={role === "student"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label className="text-sm" htmlFor="student">Student</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                className="mr-2 leading-tight"
                                type="radio"
                                value="instructor"
                                name="role"
                                checked={role === "instructor"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label className="text-sm" htmlFor="instructor">Instructor</label>
                        </div>
                    </div>
                    <button
                        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
            <div className="flex justify-center">
                Already have an account? <Link to="/login" className="font-semibold text-indigo-500 hover:underline ml-2 mr-2">Log in</Link> here!
            </div>
        </div>
    );
};

export default Signup;
