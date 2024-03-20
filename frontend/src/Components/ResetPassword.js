import axios from "axios"

const ResetPassword = () => {
    const onFormSubmit = (e) => {
        e.preventDefault()
        const URLsearcher = new URLSearchParams(window.location.search)
        const token = URLsearcher.get("token")
        const userID = URLsearcher.get("user")
        const newPassword = e.target.newPassword.value
        axios.post("http://localhost:5050/api/resetPassword", {
            id: userID,
            token: token,
            newPassword: newPassword
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