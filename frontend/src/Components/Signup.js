import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios"
import { getUser } from '../UserUtils';
import Select from 'react-select';


const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("student");
    const [orgName, setOrgName] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('');
    const [org, setOrganizations] = useState([]);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await axios.post('/api/organizations');
                setOrganizations(response.data.organizations);
                if (response.data.organizations.length > 0) {
                    setSelectedOrg(response.data.organizations[0]);
                }
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        };
        fetchOrganizations();


    }, []);

    const orgOptions = org.map(org => ({
        value: org,
        label: org
    }));


    const navigate = useNavigate();
    const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING_MODE === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL

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
        const s = (role === "student" || role === "admin") ? "approved" : "pending";
        const o = role === "admin" ? orgName : (role === "instructor" ? selectedOrg.value : null);
        console.log(selectedOrg)
        const isOrgTaken = org.includes(orgName);

   
        if (isOrgTaken) {
            alert("This organization name is already in use. Please choose a different name.");
            return;
        }
        axios.post(url + "/api/signup", {
            "email": email,
            "password": password,
            "firstName": firstName,
            "lastName": lastName,
            "role": role,
            "org": o,
            "status": s
        }, {
            headers: {
                "ngrok-skip-browser-warning": true
            }
        }).then((data) => {
            if (data.data.user) {
                getUser(email, password).then(res => {
                    if (!res.error) {
                        navigate("/dashboard")
                    }
                })
            }
            else if (data.error) {
                alert("something went wrong. please try again")
            }
        }).catch(e => console.log(e))
    };

    const handleChange = selectedOption => {
        setSelectedOrg(selectedOption);
    };


    // if (checkingAuth) {
    //     return <div>Loading...</div>;
    // }


    return (
        <div className="font-mono bg-indigo-50 h-dvh text-gray-800">
            <header className="bg-indigo-50 p-0 py-5">
                <div className="container flex justify-center items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                            <h1 className="text-3xl font-bold text-gray-900 font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                </div>
            </header>
            <div className="border-0.5 border-gray-800 border-solid relative" >
            
               </div>
               <h1 className="pt-5 text-2xl text-center font-bold text-indigo-900 font-mono">Create an Account</h1>

            <div className="flex justify-center pt-5 p-10 pb-4 bg-indigo-50 ">
                <form onSubmit={handleSignup} className="shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-300">
                    <div className="mb-4">
                        <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            className="bg-gray-50 hover:bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="lastName">
                            Last Name
                        </label>
                        <input
                            className="bg-gray-50 hover:bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="bg-gray-50 hover:bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="bg-gray-50 hover:bg-gray-100 shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 text-sm font-bold mb-2">Role</label>
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
                        <div className="flex items-center">
                            <input
                                className="mr-2 leading-tight"
                                type="radio"
                                value="admin"
                                name="role"
                                checked={role === "admin"}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <label className="text-sm" htmlFor="instructor">Admin</label>
                        </div>

                    </div>
                    {role === "admin" ? (
                        <div className="mb-6">
                            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="orgName">
                                Organization Name
                            </label>
                            <input
                                id="orgName"
                                type="text"
                                placeholder="Enter organization name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    ) : role === "instructor" ? (
                        <div className="mb-6">
                            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="org">
                                Select Organization
                            </label>
                            <Select
                                id="org"
                                value={selectedOrg}
                                onChange={handleChange}
                                options={orgOptions}
                                className="text-gray-800"
                                classNamePrefix="select"
                            />
                        </div>
                    ) : null}
                    <button
                        className="bg-indigo-500 hover:bg-indigo-700 text-gray-50 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
            <div className="flex justify-center sm:flex-row flex-col text-center">
                Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 ml-2 mr-2  md:text-base">Sign in</Link>
            </div>

        </div>
    );
};

export default Signup;
