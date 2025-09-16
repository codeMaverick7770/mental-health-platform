import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
  slot: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled"], 
    default: "pending"   
  }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
