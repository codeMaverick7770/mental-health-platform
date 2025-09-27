import Community from "../models/community.model.js";
import Message from "../models/message.model.js";

// Attach community chat event handlers to an existing io instance
export const attachCommunityChatHandlers = (io) => {
  io.on("connection", (socket) => {
    // Join community
    socket.on("joinRoom", ({ communityId }) => {
      if (!communityId) return;
      socket.join(communityId);
    });

    // Leave community
    socket.on("leaveRoom", ({ communityId }) => {
      if (!communityId) return;
      socket.leave(communityId);
    });

    // Send message (basic validation and banned check)
    socket.on("sendMessage", async ({ communityId, userId, text }) => {
      try {
        if (!communityId || !userId || !text) return;

        const community = await Community.findById(communityId).select("bannedUsers");
        if (!community) return;
        if (community.bannedUsers.some((b) => b.toString() === String(userId))) return;

        const message = await Message.create({ community: communityId, user: userId, text });

        io.to(communityId).emit("newMessage", {
          userId,
          text,
          createdAt: message.createdAt,
        });
      } catch (_) {
        // ignore errors in handler to avoid crashing the socket
      }
    });
  });
};
