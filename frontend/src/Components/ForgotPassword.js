import axios from "axios"
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate()
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
        <form onSubmit={initiateReset}>
            <input className="shadow appearance-none border rounded w-full py-2 my-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" name="email" />
            <input type="submit" value="submit" />
        </form>
    </>)
}

export default ForgotPassword