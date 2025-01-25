import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import {sendMessage, listenForMessages, startChat,} from "../Services/SocketService";
import { Message } from "../types/message";
import { User } from "../types/user";
import "../css/ChatPage.css";

const Chat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUserId = "currentUserId";  // FIXXX!!!!!!!!!!!!!!
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:3000/api/users");
      const data: User[] = await response.json();
      setUsers(data);
    };

    fetchUsers();

    listenForMessages(
      (message: { from: string; to: string; content: string }) => {
        const formattedMessage: Message = {
          from: message.from,
          to: message.to,
          content: message.content,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    );

    return () => {};
  }, []);

  const startChatHandler = (userId: string) => {
    if (selectedUser === userId) return;
    setSelectedUser(userId);
    startChat("currentUserId", userId);
  };


  const sendMessageHandler = () => {
    if (!newMessage.trim() || !currentUserId) return;  
    sendMessage(currentUserId, selectedUser!, newMessage);
  
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        from: currentUserId, 
        to: selectedUser!,
        content: newMessage,
        timestamp: new Date(),
      },
    ]);
      setNewMessage("");
  };
  

  return (
    <div
      className="chat-page"
      style={{ display: "flex", height: "100vh", flexDirection: "row-reverse" }}
    >
      <div className="chat-area" style={{ flex: 1, padding: "20px" }}>
        {!selectedUser && <div>Select a user to start a chat</div>}
        {selectedUser && (
          <div>
            <h3>Chat with {selectedUser}</h3>
            <div
              className="chat-window"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              {messages.map((message: Message, index: number) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <strong>{message.from}: </strong>
                  {message.content}
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ width: "80%", padding: "5px" }}
              />
              <button onClick={sendMessageHandler} style={{ padding: "5px" }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="chat-sidebar"
        style={{
          width: "20%",
          backgroundColor: "#fff",
          padding: "10px",
          borderLeft: "1px solid #ddd",
        }}
      >
        <h3>Users</h3>
        <ul>
          {users.map((user: User) => (
            <li
              key={user._id}
              onClick={() => startChatHandler(user._id)}
              style={{ cursor: "pointer", padding: "5px" }}
            >
              <FaUser /> {user.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
