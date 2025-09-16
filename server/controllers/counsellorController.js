import express from "express";
import Counsellor from "../models/Counsellor.js";

const router = express.Router();

// Get all counsellors with slots
export const getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find();
    res.json(counsellors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new counsellor with auto-generated slots
export const createCounsellor = async (req, res) => {
  try {
    const { name, specialization, contactNumber, institutionName, slotStartHour = 9, slotEndHour = 17, days = 7 } = req.body;

    if (!name || !specialization || !contactNumber || !institutionName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Generate slots for the given number of days and hours
    const availableSlots = [];
    const today = new Date();
    for (let day = 0; day < days; day++) {
      for (let hour = slotStartHour; hour <= slotEndHour; hour++) {
        const slot = new Date(today.getFullYear(), today.getMonth(), today.getDate() + day, hour, 0, 0);
        availableSlots.push(slot);
      }
    }

  
    const counsellor = await Counsellor.create({
      name,
      specialization,
      contactNumber,
      institutionName,
      availableSlots
    });

    res.json({ message: "Counsellor created successfully", counsellor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Router endpoints
export default router;
