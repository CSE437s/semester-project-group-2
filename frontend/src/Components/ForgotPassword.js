import axios from "axios"

const ForgotPassword = () => {
    const initiateReset = (e) => {
        e.preventDefault()
        const userEmail = e.target.email.value
        axios.post("http://localhost:5050/api/initiateReset", {
            email: userEmail
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