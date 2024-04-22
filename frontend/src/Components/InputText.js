import React, { useEffect, useState, useRef } from 'react';

export default function InputText({ addMessage }) {
    const [message, setMessage] = useState('');
    const messageRef = useRef(message)
    const setMessageAndRef = (newMessage) => {
        messageRef.current = newMessage
        setMessage(newMessage)
    }
    
    function addAMessage() {
        const message = messageRef.current
        addMessage({
            message
        });
        setMessageAndRef('');
    }
    useEffect(() => {
        const getTwoKeys = (e) => {
            if((e.metaKey || e.ctrlKey) && e.code === "Enter"){ //handle macs and windows (ew)
                addAMessage()
            }
        }
        document.addEventListener("keydown", getTwoKeys)
        return () => {
            document.removeEventListener("keydown", getTwoKeys)
        }
        //eslint-disable-next-line
    }, [])

    return (
        <div className="flex justify-center items-center">
            <textarea
                className="w-4/5 h-12 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none text-gray-700 py-2 px-4 bloc mt-2"
                placeholder="Write something..."
                value={message}
                onChange={e => setMessageAndRef(e.target.value)}
            ></textarea>
            <button
                className="ml-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-2"
                onClick={addAMessage}
            >
                Enter
            </button>
        </div>
    );
}
