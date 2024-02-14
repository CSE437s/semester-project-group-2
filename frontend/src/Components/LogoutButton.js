import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from 'react-router-dom';
const LogoutButton = () => {
    const navigate = useNavigate()
    const performLogout = () => {
        signOut(auth).then(()=>{
            alert("Successfully signed out. See ya!")
            navigate("/home")
        }).catch((e)=>{
            console.log(e)
        })
    }
    return (
        <>
            <input type="button" onClick={performLogout} value="Log Out" />
        </>
    )
}

export default LogoutButton;