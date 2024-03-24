import axios from "axios"

const ForgotPassword = () => {
    const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING_MODE ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"

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
    }
    return (<>
    pls enter your password for the reset email link (todo make this not stupid)
        <form onSubmit={initiateReset}>
            <input className="shadow appearance-none border rounded w-full py-2 my-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" name="email" />
            <input type="submit" value="submit" />
        </form>
    </>)
}

export default ForgotPassword