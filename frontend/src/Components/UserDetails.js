import { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom';
//import LogoutButton from './LogoutButton';
import { getCurrentUser, updateUserName, updateUserBio, updateUserBGColor } from "../UserUtils";
import Header from "./Header";

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
    const [dropdownOpen, setDropdownOpen] = useState(false); //dropdown for color theme

    const [backgroundColor, setBackgroundColor] = useState("");
    //const [isTA, setIsTA] = useState(false);
    const [bio, setBio] = useState("");
    const [editingBio, setEditingBio] = useState(false);

    const currentToken = localStorage.getItem("token")
    // const performReset = () => {
    //     sendPasswordResetEmail(auth, user.email).then(() => {
    //         console.log(user.email)
    //         alert("Email has been sent to " + user.email)
    //     }).catch((e) => {
    //         console.log(e)
    //     })
    // }

    const handleBioBlur = async () => {
        try {
            console.log(bio);
            setEditingBio(false);
            updateBio();


        } catch (error) {
            console.error("Error updating bio:", error);
            alert("Failed to update bio. Please try again.");
        }
    };


    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const saveBackgroundColor = async (color) => {
        try {
            await updateColor(color);
    
            setDropdownOpen(false);
            setBackgroundColor(color);
            document.getElementById('userDetailsContainer').style.backgroundColor = color;
            
        } catch (error) {
            console.error("Error saving background color:", error);
            alert("Failed to save background color. Please try again.");
        }
    };
    

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
        if (currentToken) {
            getCurrentUser().then(u => {
                const user = u.data.user
                if (user) {
                    setUser(user);
                    setRole(user.role);
                    setStatus(user.status);
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    //setIsTA(user.isTA || false);
                    setBio(user.bio || '');
                    setBackgroundColor(user.bg_color || 'white');
                   
                    document.getElementById('userDetailsContainer').style.backgroundColor = user.bg_color || 'white';
                   
                }
            }).catch((error) => {
                console.log(error);
                
            });
            
        }
        else {
            navigate("/login")
        }
    
    }, [navigate, currentToken]);



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
            updateUserName(user._id, firstName, lastName).then(res => {
                console.log(res)
                if (res === true) {
                    alert("success")
                }
            }).catch(e => console.log(e))
            navigate("/me");
        } catch (error) {
            console.error("Error updating user information:", error);
            alert("Failed to update user information. Please try again.");
        }
    };

    const updateBio = async () => {
        try {
            updateUserBio(user._id, bio).then(res => {
                console.log(res)
                if (res === true) {
                    alert("success")
                }
            }).catch(e => console.log(e))
            navigate("/me");
        } catch (error) {
            console.error("Error updating user bio:", error);
            alert("Failed to update user bio. Please try again.");
        }
    }

    const updateColor = async (color) => {
        try {
            
            updateUserBGColor(user._id, color).then(res => {
                console.log(res)
                if (res === true) {
                    alert("success")
                }
            }).catch(e => console.log(e))
            navigate("/me");
        } catch (error) {
            console.error("Error updating user bg color:", error);
            alert("Failed to update user bg color. Please try again.");
        }
    }

    return (
        <div id="userDetailsContainer" className="font-mono flex flex-col min-h-screen" style={{backgroundColor: backgroundColor}}>
            {/* header */}
            {/* <header className="bg-indigo-300 p-0 py-5">
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
            </header> */}
            <Header user={user} />


            <div id="userDetailsContainer" className="font-mono">
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

                {/* {isTA && ( */}
                <div className="bg-indigo-200 font-mono container mx-auto mt-6 p-10 rounded-lg shadow-lg h-40">
                    <div className="flex">
                        <div className="mr-4">
                            <p className="text-black font-semibold">Bio:</p>
                        </div>
                        <div>
                            {editingBio ? (
                                <input
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    onBlur={handleBioBlur}
                                    autoFocus
                                    className="text-gray-700"
                                    style={{ border: 'none', width: '100%', maxWidth: '500px', overflow: 'hidden' }}
                                />
                            ) : (
                                <p className="text-gray-700" onClick={() => setEditingBio(true)}>
                                    {bio || 'Click to add a bio'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {/* )} */}
                

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

                    <button onClick={() => navigate("/forgotPassword")} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2">
                        Reset Password
                    </button>

                    {/* Dropdown button */}

                    {/* {isTA && ( */}
                    <div className="relative inline-block text-left">
                        <div>
                            <button
                                type="button"
                                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                                onClick={toggleDropdown}
                            >
                                Page Background
                                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                        </div>

                        {/* Dropdown menu */}
                        <div className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownOpen ? "block" : "hidden"}`} role="menu" aria-orientation="vertical">
                            <div className="py-1" role="none">
                                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => {
                                    setBackgroundColor("pink");
                                    saveBackgroundColor("pink");
                                }} role="menuitem">Pink</button>
                               <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => {
                                    setBackgroundColor("blue");
                                    saveBackgroundColor("blue");
                                }} role="menuitem">Blue</button>
                               <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => {
                                    setBackgroundColor("purple");
                                    saveBackgroundColor("purple");
                                }} role="menuitem">Purple</button>
                                <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => {
                                    setBackgroundColor("grey");
                                    saveBackgroundColor("grey");
                                }} role="menuitem">Grey</button>
                            </div>
                        </div>
                    </div>

                    {/* )} */}


                </div>






            </div>
        </div>
    );
};

export default UserDetails;
