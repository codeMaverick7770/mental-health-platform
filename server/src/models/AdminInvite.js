import mongoose from 'mongoose';

const AdminInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['admin', 'counselor'], required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCollege', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);
AdminInviteSchema.index({ collegeId: 1, email: 1 });

export default mongoose.model('AdminInvite', AdminInviteSchema);
