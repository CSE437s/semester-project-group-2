import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserName, updateUserBio, updateUserBGColor } from "../UserUtils";
import Header from "./Header";
import { useRef } from "react";
import ProfilePicture from "./ProfilePicture";

const UserDetails = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    // eslint-disable-next-line
    const [status, setStatus] = useState();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [editingFirstName, setEditingFirstName] = useState(false);
    const [editingLastName, setEditingLastName] = useState(false);

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

    const bioRef = useRef(null);

    const adjustHeight = (event) => {
        const textarea = event.target;
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

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

    const handleColorChange = async (event) => {
        const color = event.target.value;
        try {
            await updateColor(color);
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

    const handleEditIconClick = () => {
        setEditingFirstName(true);
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
                    console.log("success")
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
                    console.log("success")
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
                    console.log("success")
                }
            }).catch(e => console.log(e))
            navigate("/me");
        } catch (error) {
            console.error("Error updating user bg color:", error);
            alert("Failed to update user bg color. Please try again.");
        }
    }

    return (
        <div id="userDetailsContainer" className="font-mono flex flex-col min-h-screen pb-5" style={{ backgroundColor: backgroundColor }}>
            <Header user={user} />


            <div id="userDetailsContainer" className="font-mono">
                <div className="bg-indigo-200 font-mono flex-row grid grid-cols-1 justify-center items-center container mx-auto mt-6 p-10 rounded-lg shadow-lg">
                <span className="place-self-center pb-10"><ProfilePicture height={100} width={100} isOwner={true} userId={user._id}/></span>
                    <h1 className="text-3xl font-bold text-center mb-4 flex justify-center items-center gap-3">

                    <img src="/edit_icon.png" alt="Logo" className="h-5 w-auto cursor-pointer" onClick={handleEditIconClick} />


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
                                className="text-3xl font-bold text-center hover:border hover:border-indigo-500 hover:bg-indigo-100 cursor-pointer overflow-hidden"
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
                                className="text-3xl font-bold text-center hover:border hover:border-indigo-500 hover:bg-indigo-100 cursor-pointer overflow-hidden"
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
                <div className="bg-indigo-200 font-mono container mx-auto mt-6 p-10 rounded-lg shadow-lg flex flex-col">
                    <div className="flex">
                        <div className="mr-4">
                            <p className="text-black font-semibold">Bio:</p>
                        </div>
                        <div className="flex-grow rounded-lg hover:bg-indigo-100">
                            {editingBio ? (
                                <textarea
                                    ref={bioRef}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    onBlur={handleBioBlur}
                                    onFocus={adjustHeight}
                                    onInput={adjustHeight}
                                    autoFocus
                                    className="rounded-lg bg-indigo-100 text-gray-700 w-full resize-none border-none outline-none"
                                    style={{ overflow: 'hidden' }}
                                />
                            ) : (
                                <p className="text-gray-700 break-all" onClick={() => setEditingBio(true)}>
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

                    <button onClick={() => navigate("/forgotPassword")} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2">
                        Reset Password
                    </button>

                    {/* {isTA && ( */}
                    <div className="relative inline-block text-left">
                        <div>
                            <button
                                type="button"
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-2 rounded inline-flex items-center"
                            >
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={handleColorChange}
                                    className="w-6 h-6 border-2 border-gray-300 rounded-full cursor-pointer"
                                />

                            </button>
                        </div>
                    </div>
                    {/* )} */}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
