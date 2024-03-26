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


const DEBUGGING = process.env.REACT_APP_DEBUGGING;
const url = DEBUGGING ? "http://localhost:5050" : "https://carefully-certain-swift.ngrok-free.app"
const currentToken = localStorage.getItem("token");

export default function ChatContainer() {
    
    let socketio = socketIOClient(url)
    const [chats, setChats ] = useState([])
   
    const [name, setName] = useState("");
    const [userId, setId] = useState();

    useEffect(() => {
        socketio.on("chat", senderChats => {
            setChats(senderChats)
        })
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
    }, [currentToken,  userId]);

  
 
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
