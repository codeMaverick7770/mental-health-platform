// socket.js
import { Server } from "socket.io";
import Community from "../models/community.model.js";
import Message from "../models/message.model.js";
import Session from "../models/Session.js";

let io; // global socket.io instance

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("joinRoom", ({ _id }) => {
      if (!_id) return;
      // Join raw room (community compatibility)
      socket.join(_id);
      // Also join session room alias so counselor code that emits joinRoom with a sessionId works
      socket.join(`session:${_id}`);
      console.log(`🔹 Joined community room: ${_id} and session room: session:${_id}`);
    });

    socket.on("leaveRoom", ({ _id }) => {
      if (!_id) return;
      socket.leave(_id);
      console.log(`🔸 Left community room: ${_id}`);
    });

    /** ----------------- USER ROOMS ----------------- **/
    socket.on("joinUser", ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`👤 User joined personal room: user:${userId}`);
    });

    socket.on("leaveUser", ({ userId }) => {
      if (!userId) return;
      socket.leave(`user:${userId}`);
      console.log(`👤 User left personal room: user:${userId}`);
    });

    /** ----------------- SESSION ROOMS ----------------- **/
    socket.on("joinSession", ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(`session:${sessionId}`);
      console.log(`🟢 Joined session room: session:${sessionId}`);
    });

    socket.on("leaveSession", ({ sessionId }) => {
      if (!sessionId) return;
      socket.leave(`session:${sessionId}`);
      console.log(`🔴 Left session room: session:${sessionId}`);
    });

    /** ----------------- SESSION START ----------------- **/
    socket.on("session:start", async ({ _id }) => {
      try {
        if (!_id) return;
        const session = await Session.findOne({ sessionId: _id });
        if (!session) return;

        if (session.status !== "active") {
          session.status = "active";
          if (!session.startedAt) session.startedAt = new Date();
          await session.save();
        }

        const userRoom = `user:${String(session.userId)}`;
        const sessionRoom = `session:${session.sessionId}`;

        io.to(userRoom).emit("session:started", {
          sessionId: session.sessionId,
          sessionRoom,
          counsellorId: session.counsellorId,
          counsellorName: session.counsellorName,
          startedAt: session.startedAt,
        });

        // Ensure the initiator is also in the session room to receive messages
        socket.join(sessionRoom);

        console.log(`✅ Session started: ${session.sessionId}`);
      } catch (err) {
        console.error("❌ session:start error:", err.message);
      }
    });

    /** ----------------- SESSION CHAT ----------------- **/
    socket.on("send_chat", async ({ _id, sender, text }) => {
      try {
        if (!_id || !sender || !text) return;

        const session = await Session.findOne({ sessionId: _id });
        if (!session) return;

        const newMessage = {
          message: text,
          sender, // 'user' | 'counselor' | 'system'
          timestamp: new Date(),
        };

        session.messages.push(newMessage);
        await session.save();

        io.to(`session:${_id}`).emit("session:newMessage", {
          sessionId: _id,
          ...newMessage,
        });

        console.log(`💬 Session ${_id} message from ${sender}`);
      } catch (err) {
        console.error("❌ send_chat error:", err.message);
      }
    });

    
    socket.on("chat:sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        if (!senderId || !receiverId || !text) return;

        // Save as a Message document
        const msg = await Message.create({
          user: senderId,   // sender userId
          receiver: receiverId, // custom field for direct chat
          text,
          createdAt: new Date(),
        });

        // Emit to receiver’s personal room
        io.to(`user:${receiverId}`).emit("chat:newMessage", {
          senderId,
          receiverId,
          text,
          createdAt: msg.createdAt,
        });

        console.log(`📩 Direct chat ${senderId} ➝ ${receiverId}`);
      } catch (err) {
        console.error("❌ chat:sendMessage error:", err.message);
      }
    });

    /** ----------------- DISCONNECT ----------------- **/
    socket.on("disconnect", () => {
      console.log("❎ User disconnected:", socket.id);
    });
  });

  return io;
};

// helper for controllers
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
