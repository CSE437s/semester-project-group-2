import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import React, { useEffect, useState } from 'react';

const Home = () => {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true); 

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCheckingAuth(false);
            if (user) {
                navigate('/dashboard');
            }
        });
        return unsubscribe;
    }, [navigate]);

    if (checkingAuth) {
        return <div>Loading...</div>;
    }

    return (
        <div className="font-mono home-container ">
            <header className="bg-slate-300 p-0 py-5">
            <div className="container flex justify-between items-center max-w-full">
                
            <Link to="/home"><div className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                        <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                    </div></Link>
                    
                    <div>
                        <Link to="/login" className="font-semibold text-black text-lg hover:underline mr-4">Log in</Link>
                        <Link to="/signup" className="font-semibold text-black text-lg hover:underline pr-10">Sign up</Link>
                    </div>
                </div>
            </header>
            <div className="container mx-auto mt-6 bg-slate-200 p-10">
                <h1 className="text-3xl font-bold mb-4">Welcome to Online Office Hours!</h1>
                <p className="text-lg text-gray-800 mb-6">
                    Our platform provides a seamless solution for organizing and attending office hours
                    with instructors and TAs. Say goodbye to scattered Zoom links and hello to a centralized
                    hub for academic support.
                </p>
                <h2 className="text-2xl font-bold mb-2">Key Features</h2>
                <ul className="list-disc pl-6 mb-6">
                    <li>Create customizable pages for instructors and TAs</li>
                    <li>Join video calls, text chats, or utilize whiteboard elements</li>
                    <li>Find the perfect instructor for your learning style</li>
                    <li>Enroll in classes and keep track of upcoming office hours sessions</li>
                </ul>
                <h2 className="text-2xl font-bold mb-2">How It Works</h2>
                <p className="text-lg text-gray-800 mb-6">
                    Students and instructors can sign up for an account and start creating or joining
                    office hours sessions. Instructors can customize their virtual classrooms, while
                    students can easily find and join sessions that match their needs.
                </p>
                <h2 className="text-2xl font-bold mb-2">Get Started</h2>
                <p className="text-lg text-gray-800 mb-6">
                    Ready to enhance your learning experience?
                    <Link to="/login" className="ml-2 font-semibold text-blue-600 hover:underline">Log in</Link> now or 
                    <Link to="/signup" className="font-semibold text-blue-600 hover:underline ml-2">sign up</Link> to get started!
                </p>
            </div>
        </div>
    );
};

export default Home;
