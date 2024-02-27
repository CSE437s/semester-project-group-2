import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
// import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

// const cleanFileName = (fileName) => {
//     var newFileName = ""
//     for (var i = 0; i < fileName.length; i++) {
//         const char = fileName.charAt(i)
//         if (char !== ' ' && char !== ' ' && char !== "(" && char !== ")") {
//             newFileName += char
//         }
//     }
//     return newFileName
// }

const UserDetails = () => {
    // const DEBUGGING = false
    // const base_url = "https://carefully-certain-swift.ngrok-free.app"
    // const debugging_url = "http://localhost:3001"
    // const api_url = DEBUGGING ? debugging_url : base_url

    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    // eslint-disable-next-line
    const [status, setStatus] = useState();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [editingFirstName, setEditingFirstName] = useState(false);
    const [editingLastName, setEditingLastName] = useState(false);

    const performReset = () => {
        sendPasswordResetEmail(auth, user.email).then(() => {
            console.log(user.email)
            alert("Email has been sent to " + user.email)
        }).catch((e) => {
            console.log(e)
        })
    }

    const handleFirstNameBlur = () => {
        setEditingFirstName(false);
        updateUserInfo();
    };

    const handleLastNameBlur = () => {
        setEditingLastName(false);
        updateUserInfo();
    };

    // const uploadProfilePicture = async (e) => {
    //     const photo = e.target.files[0]
    //     const renamedPhoto = new File([photo], cleanFileName(photo.name), { type: photo.type });
    //     const data = new FormData()
    //     data.append("myFile", renamedPhoto);
    //     await axios.post(api_url + "/api/fileUpload", data, {
    //         headers: {
    //             "content-type": "multipart/form-data",
    //         },
    //     });
    //     const url = "backend/uploadedFiles/" + cleanFileName(photo.name)
    //     updateProfile(user, {
    //         "photoURL": url
    //     }).then(() => {
    //         alert("Photo has been updated!")
    //         navigate("/me")
    //     }).catch(e => console.log(e));
    // }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                getDoc(userDocRef).then((d) => {
                    const docData = d.data();
                    setRole(docData.role);
                    setStatus(docData.status);
                    setFirstName(docData.firstName); // Set first name from database
                    setLastName(docData.lastName); // Set last name from database
                }).catch((error) => {
                    console.log(error);
                });
            } else {
                // If no user is signed in, navigate to the login page
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    if (!user) {
        return (
            <button onClick={() => navigate("/login")} className="hidden bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Go to login</button>

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

            // alert("User information updated successfully.");
            navigate("/me");
        } catch (error) {
            console.error("Error updating user information:", error);
            alert("Failed to update user information. Please try again.");
        }
    };

    return (
        <div className="font-mono">
            {/* header */}
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-between items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                    <div>
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


            <div classsName="">
                {/* {user && user.photoURL ? <img src={user.photoURL.replace("backend/", api_url)} className="rounded-full mx-auto mb-4" alt="Profile" width="100px" /> : null} */}

                <div className="bg-indigo-200 font-mono container mx-auto mt-6 p-10 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-4 flex justify-center items-center gap-3">

                        <img src="/edit_icon.png" alt="Logo" className="h-5 w-auto" />

                        {editingFirstName ? (
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                onBlur={handleFirstNameBlur}
                                autoFocus
                                className="text-3xl font-bold text-center bg-indigo-200 divide-none outline-none"
                                style={{ border: 'none', width: `${(firstName.length) * 20}px` }}
                            />
                        ) : (

                            <span

                                onClick={() => setEditingFirstName(true)}
                                className="text-3xl font-bold text-center hover:border hover:border-indigo-500 hover:bg-indigo-100 cursor-pointer"
                            >
                                {firstName}

                            </span>
                        )}{" "}

                        {editingLastName ? (
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                onBlur={handleLastNameBlur}
                                autoFocus
                                className="text-3xl font-bold text-center bg-indigo-200 divide-none outline-none"
                                style={{ border: 'none', width: `${(lastName.length) * 20}px` }}
                            />
                        ) : (
                            <span
                                onClick={() => setEditingLastName(true)}
                                className="text-3xl font-bold text-center hover:border hover:border-indigo-500 hover:bg-indigo-100 cursor-pointer"
                            >
                                {lastName}</span>
                        )}
                    </h1>


                    <div className="flex">
                        <div className="mr-4">
                            <p className="text-black font-semibold">Email:</p>
                        </div>
                        <div>
                            <p className="text-gray-700">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="mr-4">
                            <p className="text-black font-semibold">Role:</p>
                        </div>
                        <div>
                            <p className="text-gray-700">{role}</p>
                        </div>
                    </div>

                </div>

                <div className="bg-indigo-200 font-mono container mx-auto mt-6 p-10 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        {/* <label htmlFor="profilePicture" className="cursor-pointer bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Change Photo
                        </label>
                        <input
                            id="profilePicture"
                            type="file"
                            name="newFile"
                            accept="image/*"
                            onChange={uploadProfilePicture}
                            className="hidden"
                        /> */}
                    </div>
                    <div className="flex mt-4">
                        <button onClick={performReset} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2">
                            Reset Password
                        </button>
                       
                    </div>
                </div>



            </div>
        </div>
    );
};

export default UserDetails;
