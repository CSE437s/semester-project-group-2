import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import axios from "axios";

const cleanFileName = (fileName) => {
    var newFileName = ""
    for (var i = 0; i < fileName.length; i++) {
        const char = fileName.charAt(i)
        if (char !== ' ' && char != ' ' && char !== "(" && char !== ")") {
            newFileName += char
        }
    }
    return newFileName
}

const UserDetails = () => {
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    const [status, setStatus] = useState();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const performReset = () => {
        sendPasswordResetEmail(auth, user.email).then(() => {
            console.log(user.email)
            alert("Email has been sent to " + user.email)
        }).catch((e) => {
            console.log(e)
        })
    }
    const uploadProfilePicture = async (e) => {
        const photo = e.target.files[0]
        const renamedPhoto = new File([photo], cleanFileName(photo.name), { type: photo.type });
        const data = new FormData()
        data.append("myFile", renamedPhoto);
        await axios.post("http://localhost:3001/api/fileUpload", data, {
            headers: {
                "content-type": "multipart/form-data",
            },
        });
        const url = "backend/uploadedFiles/" + cleanFileName(photo.name)
        updateProfile(user, {
            "photoURL": url
        }).then(() => {
            alert("Photo has been updated!")
            navigate("/me")
        }).catch(e => console.log(e));
    }
    useEffect(() => {
        const currentUser = auth.currentUser
        if (currentUser) {
            setUser(currentUser)
            const userDocRef = doc(db, "users", currentUser.uid);
            if (!userDocRef) {
                alert("couldn't find your information")
            }
            else {
                getDoc(userDocRef).then((d) => {
                    const docData = d.data()
                    setRole(docData.role)
                    setStatus(docData.status)
                }).catch((error) => {
                    console.log(error)
                })
            }
        }
    }, [user])

    if (!user) {
        return (
            <div className="container mx-auto text-center mt-10">
                <h1>Please sign in to view this page.</h1>
                <button onClick={() => navigate("/login")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Go to login</button>
            </div>
        );
    }

    const updateUserInfo = async () => {
        if (!firstName || !lastName) {
            alert("First name and last name are required.");
            return;
        }

        try {
            await updateProfile(auth.currentUser, {
                displayName: `${firstName} ${lastName}`,
            });

            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                firstName: firstName,
                lastName: lastName,
            });

            alert("User information updated successfully.");
            navigate("/me");
        } catch (error) {
            console.error("Error updating user information:", error);
            alert("Failed to update user information. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {user && user.photoURL ? <img src={user.photoURL.replace("backend/", "http://localhost:3001/")} className="rounded-full mx-auto mb-4" alt="Profile" width="100px" /> : null}
            <h1 className="text-2xl font-bold text-center mb-4">Welcome, {user.email}!</h1>
            <p>Email: {user.email}</p>
            <p>Role: {role}</p>
            <p>Status: {status}</p>
            <input type="file" name="newFile" accept="image/*" onChange={uploadProfilePicture} className="mt-4" />
            <button onClick={performReset} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2">Reset Password</button>
            <button onClick={() => navigate("/home")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Go back home</button>
            <div className="mt-4">
                <label htmlFor="firstName" className="block">First Name:</label>
                <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                />
            </div>
            <div className="mt-4">
                <label htmlFor="lastName" className="block">Last Name:</label>
                <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                />
            </div>
            <button
                onClick={updateUserInfo}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
                Update Information
            </button>
        </div>
    );
};

export default UserDetails;
