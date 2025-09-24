import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
        },  
  otp: { 
    type: String, 
    required: true 
      }, 
  purpose: {
    type: String,
    enum: ["register", "resetPassword", "deleteAccount"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 
  }
});

otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
