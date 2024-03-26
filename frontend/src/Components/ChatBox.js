import React from 'react';
import { useState} from "react";
import { useEffect } from 'react'
import { findUser } from '../UserUtils';

export default function ChatBoxReciever({ user, message }) {
    // Move the useState call inside the component
    const [name, setName] = useState("");

    // Use useEffect to handle side effects like fetching data
    useEffect(() => {
        findUser(user).then(u => {
            setName(u.firstName + " " + u.lastName);
        });
    }, [user]); // Add user as a dependency to re-run the effect when user changes

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row' }}>
            {/* prof pic here */}
            <p style={{ padding: 10, backgroundColor: '#dc88c6', borderRadius: 10, maxWidth: '60%' }}>
                <strong style={{ fontSize: 13 }}>{name}</strong> <br></br>
                {message}
            </p>
        </div>
    );
}

export function ChatBoxSender({ user, message }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
            {/* prof pic here */}
            <p style={{ padding: 10, backgroundColor: '#fff', borderRadius: 10, maxWidth: '60%' }}>
                <strong style={{ fontSize: 13 }}>{user}</strong> <br></br>
                {message}
            </p>
        </div>
    );
}
