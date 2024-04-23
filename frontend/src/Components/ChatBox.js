import React, { useState, useEffect } from 'react';
import { findUser } from '../UserUtils';
import ProfilePicture from './ProfilePicture';

export default function ChatBoxReciever({ user, message }) {
    const [name, setName] = useState("");

    useEffect(() => {
        findUser(user).then(u => {
            setName(u.firstName + " " + u.lastName);
        });
    }, [user]);

    return (
        <div className="flex justify-start items-center pb-2">
            <div className="flex bg-indigo-300 rounded-lg p-3 max-w-2xl">
            <div className="flex-shrink-0 rounded-full"><ProfilePicture height={40} width={40} isOwner={false} userId={user} /></div>
                <div className="ml-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-sm break-all">{message}</p>
                </div>
            </div>
        </div>
    );
}

export function ChatBoxSender({ user, message }) {
    return (
        <div className="flex justify-end items-center pb-2">
            <div className="flex bg-white rounded-lg p-3 max-w-2xl">
                
                <div className="flex-shrink-0 rounded-full"><ProfilePicture height={40} width={40} isOwner={false} userId={user?._id} /></div>
                <div className="ml-3">
                    <p className="text-sm font-semibold">{user.firstName + " " + user.lastName}</p>
                    <p className="text-sm break-all">{message}</p> 
                </div>
            </div>
        </div>
    );
}
