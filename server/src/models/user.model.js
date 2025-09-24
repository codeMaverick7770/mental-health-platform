import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "volunteer"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ Favorites (just store media IDs)
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],

    // ✅ History (store media ID + timestamp + progress)
    history: [
      {
        media: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number, // seconds or percentage
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
