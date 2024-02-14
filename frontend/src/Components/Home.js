import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import React, { useEffect, useState } from 'react';
import './Home.css';

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
        <div class="home-container">
            <h1>Welcome to Online Office Hours!</h1>
            <p class="description">
                Our platform provides a seamless solution for organizing and attending office hours
                with instructors and TAs. Say goodbye to scattered Zoom links and hello to a centralized
                hub for academic support.
            </p>
            <h2>Key Features</h2>
            <ul>
                <li>Create customizable pages for instructors and TAs</li>
                <li>Join video calls, text chats, or utilize whiteboard elements</li>
                <li>Find the perfect instructor for your learning style</li>
                <li>Enroll in classes and keep track of upcoming office hours sessions</li>
            </ul>
            <h2>How It Works</h2>
            <p class="description">
                Students and instructors can sign up for an account and start creating or joining
                office hours sessions. Instructors can customize their virtual classrooms, while
                students can easily find and join sessions that match their needs.
            </p>
            <h2>Get Started</h2>
            <p class="description">
                Ready to enhance your learning experience? <a href="/login" class="login-link">Log in</a> now or 
                <Link to="/signup" className="login-link"> sign up</Link> to get started!
            </p>

        </div>
    );
};

export default Home;
