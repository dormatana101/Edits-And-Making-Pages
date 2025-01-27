import socketIo, { Socket } from "socket.io-client";

export const createSocket = (userId: string): typeof Socket => {
  return socketIo("http://localhost:3000", {
    query: { userId },
    transports: ["websocket"],
  });
};

export const sendMessage = (
  socket: typeof Socket,
  fromUserId: string,
  toUserId: string,
  message: string
) => {
  socket.emit("sendMessage", fromUserId, toUserId, message);
};

export const listenForMessages = (
  socket: typeof Socket,
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
  socket: typeof Socket,
  fromUserId: string,
  toUserId: string
) => {
  socket.emit("startChat", fromUserId, toUserId);
};

export const disconnectSocket = (socket: typeof Socket) => {
  socket.disconnect();
};
