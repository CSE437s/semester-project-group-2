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
        <div className="home-container bg-gray-100 p-8">
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
                <a href="/login" className="text-blue-600 hover:underline">Log in</a> now or 
                <Link to="/signup" className="text-blue-600 hover:underline ml-1">sign up</Link> to get started!
            </p>
        </div>
    );
};

export default Home;
