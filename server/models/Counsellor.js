import mongoose from "mongoose";

const counsellorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contactNumber: { type: String, required: true },
  institutionName: { type: String, required: true }, 
  availableSlots: [{ type: Date, required: true }]
});

const Counsellor = mongoose.model("Counsellor", counsellorSchema);

export default Counsellor;
