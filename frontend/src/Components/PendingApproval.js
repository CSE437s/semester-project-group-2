import React from 'react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
    return (
        <div className="text-center mt-10">
            <h1 className="text-3xl font-bold mb-4">Account Pending Approval</h1>
            <p className="text-lg mb-4">Your request to sign up as an instructor is under review. We appreciate your patience.</p>
            <p className="text-lg mb-4">You will be notified once your account has been reviewed and approved.</p>
            <Link to="/dashboard" className="text-blue-500 hover:underline">Return to Dashboard</Link>
        </div>
    );
};

export default PendingApproval;
