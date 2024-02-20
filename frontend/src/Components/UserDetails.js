import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from "firebase/firestore"; 

const UserDetails = () => {
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    const [status, setStatus] = useState();
    const navigate = useNavigate();
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
                // setCurrentDoc(userDocRef)
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

    return (<>
        <h1> {"Welcome " + user.email + "!"} </h1>
        <p> Email: {user.email} </p>
        <p> Role: {role} </p>
        <p> Status: {status} </p>
        <button onClick={()=>{
            navigate("/home")
        }} > Go back home </button>
    </>)


};

export default UserDetails;