import React, { useState } from 'react';

export default function InputText({ addMessage }) {
    const [message, setMessage] = useState('');

    function addAMessage() {
        addMessage({
            message
        });
        setMessage('');
    }

    return (
        <div className="flex justify-center items-center">
            <textarea
                className="w-4/5 h-12 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none text-gray-700 py-2 px-4 bloc mt-2"
                placeholder="Write something..."
                value={message}
                onChange={e => setMessage(e.target.value)}
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
