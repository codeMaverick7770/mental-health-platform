import User from "../models/User.js";
import Media from "../models/Media.js";

// ================= PROFILE =================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password") // don’t return password
      .populate("favorites", "title thumbnail type") // populate media info
      .populate("history.media", "title thumbnail type duration");

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password");

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ================= FAVORITES =================
export const addFavorite = async (req, res) => {
  try {
    const { mediaId } = req.params;

    if (!await Media.findById(mediaId)) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: mediaId } }, // avoid duplicates
      { new: true }
    ).populate("favorites", "title thumbnail type");

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    console.error("Add Favorite Error:", error);
    res.status(500).json({ success: false, message: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: mediaId } },
      { new: true }
    ).populate("favorites", "title thumbnail type");

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    console.error("Remove Favorite Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove favorite" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favorites",
      "title thumbnail type duration"
    );
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
};

// ================= HISTORY =================
export const addToHistory = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { progress } = req.body;

    if (!await Media.findById(mediaId)) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          history: { media: mediaId, playedAt: new Date(), progress: progress || 0 },
        },
      },
      { new: true }
    ).populate("history.media", "title thumbnail type duration");

    res.json({ success: true, data: user.history });
  } catch (error) {
    console.error("Add History Error:", error);
    res.status(500).json({ success: false, message: "Failed to add to history" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "history.media",
      "title thumbnail type duration"
    );
    res.json({ success: true, data: user.history });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { history: [] } },
      { new: true }
    );
    res.json({ success: true, message: "History cleared", data: user.history });
  } catch (error) {
    console.error("Clear History Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear history" });
  }
};
