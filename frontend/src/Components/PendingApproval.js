import React from 'react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Account Pending Approval</h1>
            <p>Your request to sign up as an instructor is under review. We appreciate your patience.</p>
            <p>You will be notified once your account has been reviewed and approved.</p>
            <p><Link to="/dashboard">Return to Dashboard</Link></p>
        </div>
    );
};

export default PendingApproval;