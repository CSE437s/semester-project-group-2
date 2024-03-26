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
        <div className="flex justify-start items-center pb-2">
            <div className="flex items-center bg-indigo-300 rounded-lg p-3 max-w-2xl">
                {/* prof pic here */}
                <div className="flex-shrink-0 h-8 w-8 bg-gray-400 rounded-full"></div>
                <div className="ml-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function ChatBoxSender({ user, message }) {
    return (
        <div className="flex justify-end items-center pb-2">
            <div className="flex items-center bg-white rounded-lg p-3 max-w-2xl">
                {/* prof pic here */}
                <div className="flex-shrink-0 h-8 w-8 bg-gray-400 rounded-full"></div>
                <div className="ml-3">
                    <p className="text-sm font-semibold">{user}</p>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}
