import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const performLogout = () => {
        signOut(auth)
            .then(() => {
                alert("Successfully signed out. See ya!");
                navigate("/home");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    };

    return (
        <button
            onClick={performLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
            Log Out
        </button>
    );
};

export default LogoutButton;
