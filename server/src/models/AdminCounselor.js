import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminCounselorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'counselor' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCollege', required: true },
    licenseId: { type: String },
    specialties: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

AdminCounselorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminCounselorSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('AdminCounselor', AdminCounselorSchema);
