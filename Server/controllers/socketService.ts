import { Server } from "socket.io";
import { Message } from "../models/Message";

const connectedUsers: Record<string, string> = {};

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log(`[SOCKET] New connection: socket.id=${socket.id}, userId=${userId}`);

    if (userId) {
      connectedUsers[userId] = socket.id;
      console.log(`[SOCKET] Registered user ${userId} with socket id ${socket.id}`);
    } else {
      console.warn(`[SOCKET] Connection without userId, socket.id=${socket.id}`);
    }

    socket.on("sendMessage", async (fromUserId: string, toUserId: string, msgContent: string) => {
      console.log(`[SOCKET] Received sendMessage from ${fromUserId} to ${toUserId}: ${msgContent}`);
      try {
        const newMessage = new Message({
          from: fromUserId,
          to: toUserId,
          message: msgContent,
          timestamp: new Date(),
        });
        await newMessage.save();
        console.log(`[SOCKET] Message saved, id=${newMessage._id}`);

        const receiverSocketId = connectedUsers[toUserId];
        if (receiverSocketId) {
          console.log(`[SOCKET] Emitting receiveMessage to user ${toUserId} with socket id ${receiverSocketId}`);
          io.to(receiverSocketId).emit("receiveMessage", {
            from: fromUserId,
            to: toUserId,
            content: msgContent,
            timestamp: new Date(),
          });
        } else {
          console.warn(`[SOCKET] Receiver ${toUserId} is not connected`);
        }
      } catch (error) {
        console.error("[SOCKET] Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Disconnected: socket.id=${socket.id}`);
      for (const [uId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          console.log(`[SOCKET] Removing user ${uId} from connectedUsers`);
          delete connectedUsers[uId];
          break;
        }
      }
    });
  });
};
