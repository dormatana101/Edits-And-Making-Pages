import React, { useEffect, useState} from "react";
import { createSocket, sendMessage, listenForMessages, startChat, disconnectSocket } from "../Services/SocketService";
import { Message } from "../types/message";
import { User } from "../types/user";
import "../css/ChatPage.css";
import { Socket } from "socket.io-client";

const Chat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const currentUserId = localStorage.getItem("userId") || "";
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const data: User[] = await response.json();

        const filtered = data.filter((u) => u._id !== currentUserId);
        setUsers(filtered);

        const dict: Record<string, string> = {};
        for (const u of data) {
          dict[u._id] = u.username;
        }
        setUserMap(dict);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();

    const newSocket = createSocket(currentUserId);
    setSocket(newSocket);

    const cleanup = listenForMessages(newSocket, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      cleanup();
      disconnectSocket(newSocket);
    };
  }, [currentUserId]);

  const fetchChatHistory = async (otherUserId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/${currentUserId}/${otherUserId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const startChatHandler = async (user: User) => {
    if (selectedUser?._id === user._id) return;
    setSelectedUser(user);

    if (socket) {
      startChat(socket, currentUserId, user._id);
    }

    await fetchChatHistory(user._id);
  };

  const sendMessageHandler = () => {
    if (!newMessage.trim() || !currentUserId || !selectedUser || !socket) return;

    sendMessage(socket, currentUserId, selectedUser._id, newMessage);

    setMessages((prev) => [
      ...prev,
      {
        from: currentUserId,
        to: selectedUser._id,
        content: newMessage,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="fb-chat-container">
      <div className="fb-chat-sidebar">
        <h3>Users</h3>
        <ul className="fb-chat-users-list">
          {users.map((user) => (
            <li key={user._id} onClick={() => startChatHandler(user)}>
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <div className="fb-chat-main">
        {selectedUser ? (
          <>
            <div className="fb-chat-header">
              Chat with {selectedUser.username}
            </div>

            <div className="fb-chat-messages">
              {messages.map((msg, index) => {
                const isMyMessage = msg.from === currentUserId;
                const fromName = userMap[msg.from] || msg.from;

                return (
                  <div
                    key={index}
                    className={`fb-chat-message ${isMyMessage ? "sent" : "received"}`}
                  >
                    <span className="fb-chat-message-sender">{fromName}:</span>
                    {msg.content}
                  </div>
                );
              })}
            </div>

            <div className="fb-chat-input-area">
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessageHandler}>Send</button>
            </div>
          </>
        ) : (
          <div className="fb-chat-placeholder">
            <h2>Welcome to the Chat</h2>
            <p>Select a user on the right to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
