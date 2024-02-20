import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import axios from "axios"
const UserDetails = () => {
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    const [status, setStatus] = useState();
    const navigate = useNavigate();

    const performReset = () => {
        sendPasswordResetEmail(auth, user.email).then(()=>{
            console.log(user.email)
            alert("Email has been sent to " + user.email)
        }).catch((e)=>{
            console.log(e)
        })
    }
    const uploadProfilePicture = (e) => {
        const photo = e.target.files[0] 
        const data = new FormData()
        data.append("myFile", photo);
        axios.post("http://localhost:3001/api/fileUpload", data, {
        headers: {
            "content-type": "multipart/form-data",
        },
        }); //I ne
        // const data = new FormData()
        // data.append("newFile", photo)
        // fetch("api/fileUpload", data, {
        //     headers: {
        //         "content-type": "multipart/form-data"
        //     }
        // }).then(()=>{
        //     console.log("success")
        // }).catch((e)=> {
        //     console.log(e)
        // });

        // })
        // console.log(JhotoPath))
        // const url =  URL.createObjectURL(photoPath)
        // updateProfile(user, {
        //     "photoURL": url
        // }).then(()=>{
        //     alert("Photo has been updated!")
        //     navigate("/me")
        // }).catch(e=> console.log(e));
    }
    useEffect(()=>{
        const currentUser = auth.currentUser
        if(currentUser) {
            console.log("User currently logged in:", currentUser.displayName)
            setUser(currentUser)
            const userDocRef = doc(db, "users", currentUser.uid);
            if(!userDocRef) {
                alert("couldn't find your information")
            }
            else {
                getDoc(userDocRef).then((d)=>{
                    const docData = d.data()
                    setRole(docData.role)
                    setStatus(docData.status)
                }).catch((error)=> {
                    console.log(error)
                })
            }
        }
        else {
            console.log("No one is logged in right now")
        }
        console.log("Current user is ", user)
    })

    if(!user) {
        return (<> 
            <h1> Please sign in to view this page. </h1>
            <button onClick={()=>{
                navigate("/login")
            }}> Go to login </button>
        </>)
    }
    console.log(user.photoURL)

    return (<>
        { user ? <img width="100px" src={user.photoURL} /> : <></>}
        <h1> {"Welcome " + user.email + "!"} </h1>
        <p> Email: {user.email} </p>
        <p> Role: {role} </p>
        <p> Status: {status} </p>
        <input type="file" name="newFile" accept="image/*" onChange={uploadProfilePicture}/>
        <button onClick={performReset} > Reset Password</button>
        <button onClick={()=>{
            navigate("/home")
        }} > Go back home </button>
    </>)


};

export default UserDetails;