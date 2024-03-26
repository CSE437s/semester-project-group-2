import { logout } from '../UserUtils';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const performLogout = () => {
        logout()
            .then((res) => {
                if(res === true) {
                    alert("Successfully signed out. See ya!");
                    navigate("/home");
                }
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    };

    return (
        <button
            onClick={performLogout}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
            Log Out
        </button>
    );
};

export default LogoutButton;
