import { io } from "socket.io-client";

const userId = localStorage.getItem("userId") || ""; 

export const socket = io("http://localhost:3000", {
  query: { userId },
  transports: ["websocket"], 
});

export const sendMessage = (fromUserId: string, toUserId: string, message: string) => {
  socket.emit("sendMessage", fromUserId, toUserId, message);
};

export const listenForMessages = (
  callback: (message: { from: string; to: string; content: string; timestamp: Date }) => void
) => {
  socket.on("receiveMessage", callback);
};

export const startChat = (fromUserId: string, toUserId: string) => {
  socket.emit("startChat", fromUserId, toUserId);
};

export const disconnectSocket = () => {
  socket.disconnect();
};
