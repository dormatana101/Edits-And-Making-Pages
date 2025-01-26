import { Server } from "socket.io";

const connectedUsers: Record<string, string> = {};

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log("New connection:", userId, socket.id);

    if (userId) {
      connectedUsers[userId] = socket.id;
    }

    socket.on("sendMessage", (fromUserId: string, toUserId: string, message: string) => {
      console.log("sendMessage from", fromUserId, "to", toUserId, "message:", message);
      console.log("connectedUsers:", connectedUsers);

      const receiverSocketId = connectedUsers[toUserId];
      console.log("receiverSocketId:", receiverSocketId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          from: fromUserId,
          to: toUserId,
          content: message,
          timestamp: new Date(),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      for (const [uId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          delete connectedUsers[uId];
          break;
        }
      }
    });
  });
};
