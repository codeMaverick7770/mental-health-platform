import { Server } from "socket.io";
import Community from "./models/community.model.js";
import Message from "./models/message.model.js";

let io; // will store the socket.io server instance

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join community
    socket.on("joinRoom", ({ communityId }) => {
      socket.join(communityId);
    });

    // Leave community
    socket.on("leaveRoom", ({ communityId }) => {
      socket.leave(communityId);
    });

    // Send message
    socket.on("sendMessage", async ({ communityId, userId, text }) => {
      const community = await Community.findById(communityId);
      if (!community) return;
      if (community.bannedUsers.includes(userId)) return;

      const message = await Message.create({
        community: communityId,
        user: userId,
        text,
      });

      io.to(communityId).emit("newMessage", {
        userId,
        text,
        createdAt: message.createdAt,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

// optional helper to get the io instance elsewhere
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
