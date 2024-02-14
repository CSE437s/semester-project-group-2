import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("")
    const handleForgotPassword = () => {
        console.log("resetting password...")
        sendPasswordResetEmail(auth, email).then(()=>{
            alert("An email to reset your password has been sent!")
        }).catch((e)=>{
            if(e.code === "auth/invalid-email") {
                alert("Please enter a valid email and then click \"forgot password?\"")
            }
        })
    }
    const navigate = useNavigate(); // Initialize useNavigate hook

    const performLogin = (e) => {
        e.preventDefault();
        if(!e.target.email.value) {
            alert("Please enter an email!")
            return;
        }
        if(!e.target.current_password.value) {
            alert("Please enter a password!")
            return;
        }
        const email = e.target.email.value;
        const pass = e.target.current_password.value;


        signInWithEmailAndPassword(auth, email, pass)
            .then((credentials) => {
                console.log("Success!");
                setUser(credentials.user);
                navigate('/dashboard'); // Navigate to the dashboard route
            })
            .catch((error) => {
                if (error.code === "auth/invalid-credential") {
                    console.log("User with that email was not found, creating new account with these credentials.");
                    const rerouteToNewAccount = window.confirm("You don't seem to have an account. Would you like to Sign Up?")
                    if(rerouteToNewAccount === true) {
                        navigate("/signup")
                    }
                    
                } else if (error.code === "auth/invalid-email") {
                    console.log("Invalid Email");
                }
            });
    };

    return (
        <>
          <form onSubmit={performLogin}>
            <input type="text" name="email" onChange={(e)=>{
                 setEmail(e.target.value)
            }}/>
            <input type="password" name="current_password"/>
            <input type="submit" value="login"/>
            <input type="button" value="forgot password?" onClick={handleForgotPassword} />
        </form>
        </>
    );
};

export default Login;