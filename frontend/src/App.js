import './App.css';
import Login from "./Components/Login"
import Signup from './Components/Signup';
import PendingApproval from './Components/PendingApproval'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/Home"
import Dashboard from './Components/Dashboard';
import UserDetails from './Components/UserDetails';
import ClassDetails from './Components/ClassDetails';
import React from 'react';
import Classroom from "./Components/Classroom"
import CreateClassForm from "./Components/CreateClassForm";
import Whiteboard from './Components/Whiteboard';
import ResetPassword from "./Components/ResetPassword";
import ForgotPassword from "./Components/ForgotPassword";
import ProfilePage from './Components/ProfilePage';
import Moveable from './Components/Moveable';
import CodeEditor from './Components/CodeEditor';



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
        <Route path="/classrooms/:TAid" element={<Classroom />} />
        <Route path="/whiteboard" element={<Whiteboard height={500} width={500}/>} /> 
        <Route path="/code" element={<CodeEditor />} /> 
        <Route path="/passwordReset" element={<ResetPassword />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/users/:userId" element={<ProfilePage/>} />
        <Route path="/resize" element={<Moveable/>} />

      </Routes>
    </Router>
  );
}

export default App;
