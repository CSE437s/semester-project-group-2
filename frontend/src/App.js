import logo from './logo.svg';
import './App.css';
import Login from "./Components/Login"
import Signup from './Components/Signup';
import PendingApproval from './Components/PendingApproval'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct import statement
import Home from "./Components/Home"
import Dashboard from './Components/Dashboard';
import UserDetails from './Components/UserDetails';
import ClassDetails from './Components/ClassDetails';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';



const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Clean up subscription
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/class/:classId" element={<ClassDetails />} />
        <Route path="/me" element={<UserDetails />} />

      </Routes>
    </Router>
  );
}

export default App;
