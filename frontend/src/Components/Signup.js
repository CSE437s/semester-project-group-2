import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase'; 

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("student");
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        
        const user = supabase.auth.user();
        setCheckingAuth(false);
        if (user) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const { user, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;
            const { data, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                    status: role === "instructor" ? "pending" : "approved",
                    id: user.id
                }
            ]);

            if (insertError) throw insertError;

            // For instructors, check the status
            if (role === "instructor") {
                navigate('/pending-approval');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Signup Error: ", error.message);
            alert(error.message); // Show error message to the user
        }
    };

    if (checkingAuth) {
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
                <form onSubmit={handleSignup} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-200">
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
