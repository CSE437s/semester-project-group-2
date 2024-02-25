import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Signup Success:", userCredential.user);
            const userDocRef = doc(db, "users", userCredential.user.uid);
            
            await setDoc(userDocRef, {
                email: email,
                role: role,
                status: role === "instructor" ? "pending" : "approved",
                id: userCredential.user.uid
            });

            // For instructors, check the status
            if (role === "instructor") {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().status === "pending") {
                    alert("Your sign up as an instructor is pending approval. You will be notified once your account has been reviewed.");
                    navigate('/pending-approval');
                } else {
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert(error.message); // Show error message to the user
        }
    };

    return (
        <>
            <form onSubmit={handleSignup}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                
                {/* Role Selection */}
                <div onChange={(e) => setRole(e.target.value)}>
                    <input type="radio" value="student" name="role" defaultChecked /> Student
                    <input type="radio" value="instructor" name="role" /> Instructor
                </div>

                <button type="submit">Sign Up</button>
            </form>
        </>
    );
};

export default Signup;
