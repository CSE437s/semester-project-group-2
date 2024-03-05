import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Login = () => {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const user = supabase.auth.user();
        setCheckingAuth(false);
        if (user) {
            navigate('/dashboard');
        }
    }, [navigate]);


    const performLogin =  async (e) => {
        e.preventDefault();
        if (!e.target.email.value) {
            alert("Please enter an email!");
            return;
        }
        if (!e.target.current_password.value) {
            alert("Please enter a password!");
            return;
        }
        const email = e.target.email.value;
        const pass = e.target.current_password.value;

        try {
            const { user, error } = await supabase.auth.signIn({
                email: email,
                password: pass
            });

            if (error) throw error;

            console.log("Success!");
            localStorage.setItem("userID", user.id);
            navigate('/dashboard'); 
        } catch (error) {
            alert(error.message);
        }
    };

    const handleForgotPassword = async () => {
        console.log("resetting password...")
        const { data, error } = await supabase.auth.api.resetPasswordForEmail(email);
        if (error) {
            alert(error.message);
        } else {
            alert("An email to reset your password has been sent!");
        }
    };

    if (checkingAuth) {
        return (
            <div className="flex justify-center items-center h-screen">
              <div className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
                </svg>
              </div>
            </div>
          );    }

    return (
        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-center items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                </div>
            </header>
            <div className="flex justify-center mt-6 p-10 pb-4">
                <form onSubmit={performLogin} className="shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg bg-indigo-200">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="current_password"
                            type="password"
                            name="current_password"
                            placeholder="Password"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <input
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            value="Login"
                        />
                        <input
                            className="inline-block align-baseline font-bold text-sm text-indigo-500 hover:text-indigo-800"
                            type="button"
                            value="Forgot Password?"
                            onClick={handleForgotPassword}
                        />
                    </div>
                </form>
            </div>
            <div className="flex justify-center">
            Don't have an account? <Link to="/signup" className="font-semibold text-indigo-500 hover:underline ml-2 mr-2">Sign up</Link> to get started!
            </div>
           
        </div>
    );
};

export default Login;
