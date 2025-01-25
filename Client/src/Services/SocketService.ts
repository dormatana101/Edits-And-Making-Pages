import io from 'socket.io-client';

const socket = io("http://localhost:3000");

export const sendMessage = (fromUserId: string, toUserId: string, message: string) => {
  socket.emit("sendMessage", fromUserId, toUserId, message); 
};

export const listenForMessages = (callback: (message: { from: string; to: string; content: string }) => void) => {
  socket.on("receiveMessage", callback);
};

export const startChat = (userId: string, otherUserId: string) => {
  socket.emit("startChat", userId, otherUserId);
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
