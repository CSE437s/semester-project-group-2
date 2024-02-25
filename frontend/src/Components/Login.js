import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate hook

    const performLogin = (e) => {
        e.preventDefault();
        if (!e.target.email.value) {
            alert("Please enter an email!");
            return;
        }
        if (!e.target.current_password.value) {
            alert("Please enter a password!");
            return;
        }
        const email = e.target.email.value;
        const pass = e.target.current_password.value;

        signInWithEmailAndPassword(auth, email, pass)
            .then((credentials) => {
                console.log("Success!");
                localStorage.setItem("userID", credentials.user.uid);
                setUser(credentials.user);
                navigate('/dashboard'); // Navigate to the dashboard route
            })
            .catch((error) => {
                if (error.code === "auth/invalid-credential") {
                    alert("Incorrect password");
                } else if (error.code === "auth/invalid-email") {
                    alert("Invalid Email");
                }
            });
    };

    const handleForgotPassword = () => {
        console.log("resetting password...")
        sendPasswordResetEmail(auth, email).then(()=>{
            alert("An email to reset your password has been sent!")
        }).catch((e)=>{
            if(e.code === "auth/invalid-email") {
                alert("Please enter a valid email and then click \"forgot password?\"");
            }
        });
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={performLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="text"
                        name="email"
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
                        id="current_password"
                        type="password"
                        name="current_password"
                        placeholder="Password"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <input
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        value="Login"
                    />
                    <input
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        type="button"
                        value="Forgot Password?"
                        onClick={handleForgotPassword}
                    />
                </div>
            </form>
        </div>
    );
};

export default Login;
