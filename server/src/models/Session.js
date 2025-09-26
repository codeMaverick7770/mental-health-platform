import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentInfo: {
    sessionDuration: Number,
    messageCount: Number,
    engagementLevel: String
  },
  // Mirrors booking state
  booked: { type: Boolean, default: false },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counsellor',
    required: false
  },
  counsellorName: {
    type: String,
    required: false
  },
  // Optional link back to booking
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: false
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  messages: [{
    message: String,
    sender: {
      type: String,
      enum: ['user', 'counselor', 'system']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  riskAssessment: {
    overallRisk: String,
    suicidalIdeation: String,
    selfHarmRisk: String,
    isolation: String,
    confidence: Number
  },
  immediateActions: [{
    priority: String,
    action: String,
    details: String,
    timeline: String
  }],
  bookingNeeded: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Session', sessionSchema);
