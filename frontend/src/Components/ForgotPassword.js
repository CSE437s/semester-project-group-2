import axios from "axios"
import { Link, useNavigate} from "react-router-dom";

const ForgotPassword = () => {
    const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING_MODE ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"
    const navigate = useNavigate();

    const initiateReset = (e) => {
        e.preventDefault()
        const userEmail = e.target.email.value
        axios.post(url + "/api/initiateReset", {
            email: userEmail
        },
            {
                headers: {
                    "ngrok-skip-browser-warning": true
                }
            }).then((res) => {
                // const resetLink = res.data.resetLink
            }).catch(e => console.log(e))
            alert("Please check your email for a reset link");
            navigate("/login")
    }
    return (<>

        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-center items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OH</h1>
                        </div>
                    </Link>
                </div>
            </header>
        </div>

        <div className="flex justify-center mt-6 p-10 pb-4 font-mono">
            <div className="mb-4">
                <form onSubmit={initiateReset} className="shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-200">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Enter your email to reset your password
                </label>
                    <input placeholder="Email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6" type="text" name="email" />
                    <input type="submit" value="Submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" />
                </form>
            </div>

        </div>

    </>)
}

export default ForgotPassword