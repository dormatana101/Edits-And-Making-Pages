import { Server } from "socket.io";
import { Message } from "../models/Message";

const connectedUsers: Record<string, string> = {};

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log("New connection:", userId, socket.id);

    if (userId) {
      connectedUsers[userId] = socket.id;
    }

    socket.on("sendMessage", async (fromUserId: string, toUserId: string, msgContent: string) => {
      console.log("sendMessage from", fromUserId, "to", toUserId, "message:", msgContent);
      console.log("connectedUsers:", connectedUsers);

      try {
        const newMessage = new Message({
          from: fromUserId,
          to: toUserId,
          message: msgContent,
          timestamp: new Date(),
        });
        await newMessage.save();

        const receiverSocketId = connectedUsers[toUserId];
        console.log("receiverSocketId:", receiverSocketId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", {
            from: fromUserId,
            to: toUserId,
            content: msgContent,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error saving message:", error);
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
