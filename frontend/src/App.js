
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
import Classroom from "./Components/Classroom"
import CreateClassForm from "./Components/CreateClassForm";
import Whiteboard from './Components/Whiteboard';
import ResetPassword from "./Components/ResetPassword";
import ForgotPassword from "./Components/ForgotPassword";



const App = () => {
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
        <Route path="/create-class" element={<CreateClassForm />} />
        <Route path="/classrooms/:classId/:TAid" element={<Classroom />} />
        {/* <Route path="/whiteboard" element={<Whiteboard />} /> for debugging purposes */}
        <Route path="/passwordReset" element={<ResetPassword />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />

      </Routes>
    </Router>
  );
}

export default App;
