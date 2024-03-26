import React, { useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import ChatBoxReciever from './ChatBox'
import { ChatBoxSender } from './ChatBox'

import InputText from './InputText'
import { useState} from "react";
// import LogoutButton from './LogoutButton';

// import OHschedule from "./OHSchedule";
import { getCurrentUser} from "../UserUtils";
// import { getClassByCode, getClassByID } from "../ClassUtils";

// import ChatBoxReciever from "./ChatBox";
// import { ChatBoxSender } from "./ChatBox";
// import InputText from "./InputText";


export default function ChatContainer() {
    const currentToken = localStorage.getItem("token");
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;;
    const url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL
    const socketio = socketIOClient(url, {
        autoConnect: false,
        extraHeaders: {
            "ngrok-skip-browser-warning": true
        }
    })
    const [chats, setChats ] = useState([])
   
    const [name, setName] = useState("");
    const [userId, setId] = useState();

    useEffect(() => {
        socketio.on("connect", () => {
            console.log("socket connected")
        })
        socketio.on('connect_error', (e)=>{
            console.log("error", e)
        })
        socketio.on("chat", senderChats => {
            setChats(senderChats)
        })
        socketio.connect()
    })

    useEffect(() => {
        if (currentToken) {
            getCurrentUser().then(u => {
                const user = u.data.user
                setId(user._id)

                setName(user.firstName + " " + user.lastName)
                console.log(name);
            })
        
        }
        return () => socketio.disconnect()
    }, [userId, name, currentToken, socketio]);

  
 
    function sendChatToSocket(chat) {
        socketio.emit("chat", chat )
    }

    function addMessage(chat) {
        const newChat = {...chat, userId}
        setChats([...chats, newChat])
        sendChatToSocket([...chats, newChat])
    }

    function ChatsList() {
        return chats.map((chat, index) => {
            const isCurrentUser = chat.userId === userId;
            if (isCurrentUser) {
                return <ChatBoxSender key={index} message={chat.message} user={name} />;
            } else {
                console.log(chat.userId);
                return <ChatBoxReciever key={index} message={chat.message} user={chat.userId} />;
            }
        });
    }
    

  return (
    <div className="container mx-auto px-4 py-8 bg-indigo-200 rounded-lg shadow-md rounded px-8 pt-6 pb-8 mb-4 bg-indigo-200">
       <ChatsList />
       <InputText addMessage={addMessage} />
       
    </div>
  )
}
