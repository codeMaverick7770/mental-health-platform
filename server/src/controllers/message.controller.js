import Message from "../models/message.model.js";

// Fetch last 50 messages in a community
export const getMessages = async (req, res) => {
  try {
    const { communityId } = req.params;

    const messages = await Message.find({ community: communityId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
