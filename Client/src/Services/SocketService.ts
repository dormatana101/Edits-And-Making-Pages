import { io, Socket } from "socket.io-client";

export const createSocket = (userId: string): Socket => {
  return io("http://localhost:3000", {
    query: { userId },
    transports: ["websocket"],
  });
};

export const sendMessage = (
  socket: Socket,
  fromUserId: string,
  toUserId: string,
  message: string
) => {
  socket.emit("sendMessage", fromUserId, toUserId, message);
};

export const listenForMessages = (
  socket: Socket,
  callback: (message: {
    from: string;
    to: string;
    content: string;
    timestamp: Date;
  }) => void
) => {
  socket.on("receiveMessage", callback);

  return () => {
    socket.off("receiveMessage", callback);
  };
};

export const startChat = (
  socket: Socket,
  fromUserId: string,
  toUserId: string
) => {
  socket.emit("startChat", fromUserId, toUserId);
};

export const disconnectSocket = (socket: Socket) => {
  socket.disconnect();
};
