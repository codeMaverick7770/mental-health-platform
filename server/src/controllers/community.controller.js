import Community from "../models/community.model.js";
import User from "../models/user.model.js";

// Seed default communities for a new college
export const createDefaultCommunities = async (collegeId) => {
  const DEFAULT_COMMUNITIES = [
    { name: "Stress", description: "Discuss stress-related issues" },
    { name: "Anxiety", description: "Share anxiety experiences" },
    { name: "Depression", description: "Support each other with depression" },
  ];

  for (const c of DEFAULT_COMMUNITIES) {
    await Community.findOneAndUpdate(
      { college: collegeId, name: c.name },
      { ...c, college: collegeId },
      { upsert: true, new: true }
    );
  }
};

// Create a single community for the authenticated user's college
export const createCommunity = async (req, res) => {
  try {
    const collegeId = req.user.adminCollege;
    const { name, description } = req.body;

    if (!collegeId) {
      return res.status(400).json({ error: "College not found for user" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "'name' is required" });
    }

    const community = await Community.findOneAndUpdate(
      { college: collegeId, name: name.trim() },
      { name: name.trim(), description: description || "", college: collegeId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ community });
  } catch (err) {
    // Handle duplicate key error gracefully
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Community with this name already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Seed default communities via API for the authenticated user's college
export const seedDefaultCommunities = async (req, res) => {
  try {
    const collegeId = req.user.adminCollege;
    if (!collegeId) {
      return res.status(400).json({ error: "College not found for user" });
    }
    await createDefaultCommunities(collegeId);
    const communities = await Community.find({ college: collegeId }).select("name description college");
    return res.status(201).json({ message: "Defaults seeded", communities });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Fetch all communities for the logged-in user's college
export const getUserCommunities = async (req, res) => {
  try {
    const collegeId = req.user.adminCollege; // comes from updated auth middleware

    if (!collegeId) {
      return res.status(400).json({ error: "College not found for user" });
    }

    const communities = await Community.find({ college: collegeId })
      .select("-bannedUsers") // don't expose bannedUsers array
      .populate("members.user", "name role"); // optional: populate member info

    res.json({ communities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Join a community
export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ error: "Community not found" });

    if (community.bannedUsers.includes(userId)) {
      return res.status(403).json({ error: "You are banned from this community" });
    }

    const alreadyMember = community.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    if (alreadyMember) return res.json({ message: "Already a member" });

    community.members.push({ user: userId, role: "member" });
    await community.save();

    res.json({ message: "Joined community" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave a community
export const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    await Community.findByIdAndUpdate(communityId, {
      $pull: { members: { user: userId } },
    });

    res.json({ message: "Left community" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ban user (moderator/admin only)
export const banUser = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can ban users" });
    }

    await Community.findByIdAndUpdate(communityId, {
      $addToSet: { bannedUsers: userId },
      $pull: { members: { user: userId } },
    });

    res.json({ message: "User banned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unban user
export const unbanUser = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can unban users" });
    }

    await Community.findByIdAndUpdate(communityId, {
      $pull: { bannedUsers: userId },
    });

    res.json({ message: "User unbanned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
