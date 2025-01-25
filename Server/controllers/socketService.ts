import { Server } from "socket.io";
import { Message } from "../models/Message"; 

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("sendMessage", async (fromUserId: string, toUserId: string, message: string) => {
      try {
        const newMessage = new Message({
          from: fromUserId,  
          to: toUserId,      
          message,
          timestamp: new Date(),
        });

        await newMessage.save(); 

        io.emit("receiveMessage", {
          from: fromUserId,
          to: toUserId,
          content: message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("startChat", (userId: string, otherUserId: string) => {
      console.log(`Chat started between ${userId} and ${otherUserId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
