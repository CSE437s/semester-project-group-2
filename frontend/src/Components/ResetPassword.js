import axios from "axios"

const ResetPassword = () => {
    const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING;
    const url = DEBUGGING_MODE ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"

    const onFormSubmit = (e) => {
        e.preventDefault()
        const URLsearcher = new URLSearchParams(window.location.search)
        const token = URLsearcher.get("token")
        const userID = URLsearcher.get("user")
        const newPassword = e.target.newPassword.value
        axios.post(url + "/api/resetPassword", {
            id: userID,
            token: token,
            newPassword: newPassword
        }, {
            headers: {
                "ngrok-skip-browser-warning": true
            }
        }).then(res => console.log(res)).catch(e => console.log(e))
    }
    return (<>
        change password time. pls enter your new one
        <form onSubmit={onFormSubmit}>
            <input className="shadow appearance-none border rounded w-full py-2 my-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" name="newPassword" />
            <input type="submit" value="submit" />
        </form>
    </>)
}

export default ResetPassword