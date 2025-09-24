import Media from "../models/Media.js";

// GET all media (with filters)
export const getAllMedia = async (req, res) => {
  try {
    const { type, category, language, tags } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (language) filter.language = language;
    if (tags) filter.tags = { $in: tags.split(",") };

    const media = await Media.find(filter);
    res.json({ success: true, data: media });
  } catch (error) {
    console.error("Get Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch media" });
  }
};

// GET single media
export const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }
    res.json({ success: true, data: media });
  } catch (error) {
    console.error("Get Media By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch media" });
  }
};

// CREATE media
export const createMedia = async (req, res) => {
  try {
    const newMedia = new Media(req.body);
    await newMedia.save();
    res.status(201).json({ success: true, data: newMedia });
  } catch (error) {
    console.error("Create Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to create media" });
  }
};

// UPDATE media
export const updateMedia = async (req, res) => {
  try {
    const updated = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to update media" });
  }
};

// DELETE media
export const deleteMedia = async (req, res) => {
  try {
    const deleted = await Media.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }
    res.json({ success: true, message: "Media deleted" });
  } catch (error) {
    console.error("Delete Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete media" });
  }
};
