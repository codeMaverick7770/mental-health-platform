import mongoose from 'mongoose';

const AdminRiskEventSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCollege', required: true },
    sessionId: { type: String, required: true },
    type: { type: String, enum: ['alert', 'sos', 'insight', 'trend'], required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'crisis'], required: true },
    message: { type: String },
  },
  { timestamps: true }
);

AdminRiskEventSchema.index({ collegeId: 1, createdAt: -1 });
AdminRiskEventSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('AdminRiskEvent', AdminRiskEventSchema);
