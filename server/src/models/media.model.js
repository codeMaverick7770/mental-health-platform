import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["audio", "video"], 
      required: true,
    },
    category: {
      type: [String],
      enum: ["rain", "weather", "podcast", "meditation", "music", "nature"],
      default: [],
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ["en", "hin", "mar"],
      default: "en",
    },
    tags: {
      type: [String],
      default: [],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", MediaSchema);

export default Media;
