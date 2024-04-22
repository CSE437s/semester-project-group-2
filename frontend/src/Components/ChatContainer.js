import React, { useEffect, useRef } from 'react'
import socketIOClient from 'socket.io-client'
import ChatBoxReciever from './ChatBox'
import { ChatBoxSender } from './ChatBox'

import InputText from './InputText'
import { useState} from "react";

import { getCurrentUser} from "../UserUtils";

export default function ChatContainer(props) {
    const currentToken = localStorage.getItem("token");
    const DEBUGGING = process.env.REACT_APP_DEBUGGING;;
    const url = DEBUGGING === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL

   
    const socket = useRef()
    const [userId, setId] = useState();

    const idRef = useRef(userId)
    const setIdRef = (info) => {
        idRef.current = info
        setId(info)
    }
    const [chats, setChats ] = useState([])
    const chatsRef = useRef(chats)
    const setChatsRef = (info) => {
        chatsRef.current = info
        setChats(info)
    }
    const [userV, setUser] = useState()
    const userRef = useRef(userV)
    const setUserRef = (info) => {
        userRef.current = info
        setUser(info)
    }

    useEffect(() => {
        if(!socket.current) {
            socket.current = socketIOClient(url, {
                autoConnect: true,
                extraHeaders: {
                    "ngrok-skip-browser-warning": true
                }
            })
        }
        const socketio = socket.current
        if(socketio.connected === false) {
            socketio.connect()
        }
        console.log(socketio.connected)
        socketio.on("connect", () => {
            console.log("chat socket connected")
        })
        socketio.on("disconnect", () => {
            console.log("chat socket disconnected")
        })
        socketio.on('connect_error', (e)=>{
            console.log("error", e)
        })
        socketio.on("chat", senderChats => {
            setChatsRef(senderChats)
        })
        return () => socket.current.disconnect()
        //eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (currentToken) {
            getCurrentUser().then(u => {
                const user = u.data.user
                setIdRef(user._id)
                if(!userRef.current) {
                    setUserRef(user)
                }
            })
        
        }
        else {
            console.log("no token")
        }
    });
 
    function sendChatToSocket(chat) {
        socket.current.emit("chat", chat )
    }

    function addMessage(chat) {
        const id = idRef.current
        const newChat = {...chat, id}
        setChatsRef([...chatsRef.current, newChat])
        sendChatToSocket(chatsRef.current)
    }   

  return (
    <div className="container mx-auto px-4 py-8 bg-indigo-200 rounded-lg shadow-md rounded px-8 pt-6 pb-8 mb-4 bg-indigo-200 overflow-y-scroll" style={{width: props.width, height: props.height}}>
       {chatsRef.current && chatsRef.current.map((chat, index) => {
            const isCurrentUser = chat.id === idRef.current;
            if (isCurrentUser === true) {
                return <ChatBoxSender key={index} message={chat.message} user={userRef.current} />;
            } else {
                return <ChatBoxReciever key={index} message={chat.message} user={chat.id} />;
            }
        })}
       <InputText addMessage={addMessage} />
       
    </div>
  )
}
