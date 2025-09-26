import mongoose from 'mongoose';

const AdminCollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },

    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    adminPhone: { type: String },

    verification: {
      method: { type: String, enum: ['email', 'dns'], default: 'email' },
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      token: { type: String },
      verifiedAt: { type: Date }
    },

    settings: {
      allowSelfSignup: { type: Boolean, default: true },
      studentDomainStrict: { type: Boolean, default: true },
      allowedRoles: { type: [String], default: ['student', 'counselor', 'admin'] },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AdminCollege = mongoose.model('AdminCollege', AdminCollegeSchema); 

export default AdminCollege;