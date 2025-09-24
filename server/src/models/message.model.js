import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Index for fast retrieval per community
MessageSchema.index({ community: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);
