import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g., "Stress"
    description: { type: String },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminCollege",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["member", "moderator"], default: "member" },
      },
    ],

    bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure unique community per college
CommunitySchema.index({ college: 1, name: 1 }, { unique: true });

export default mongoose.model("Community", CommunitySchema);
