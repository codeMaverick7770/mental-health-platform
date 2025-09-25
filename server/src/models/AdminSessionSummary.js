import mongoose from 'mongoose';

const AdminSessionSummarySchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCollege', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminCounselor' },

    sessionId: { type: String, required: true, unique: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationMinutes: { type: Number },
    turnsCount: { type: Number },
    language: { type: String },

    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'crisis'], default: 'low' },
    sentiments: {
      avg: { type: Number },
      timeline: [
        {
          t: { type: Number },
          score: { type: Number },
        },
      ],
    },
    topics: { type: [String], default: [] },
    copingStrategies: { type: [String], default: [] },
    flags: [
      {
        level: { type: String },
        tag: { type: String },
        note: { type: String },
      },
    ],
    summaryText: { type: String },
  },
  { timestamps: true }
);

AdminSessionSummarySchema.index({ collegeId: 1, createdAt: -1 });

export default mongoose.model('AdminSessionSummary', AdminSessionSummarySchema);
