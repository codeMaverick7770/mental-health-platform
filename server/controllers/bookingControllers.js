import express from "express";
import Counsellor from "../models/Counsellor.js";
import Booking from "../models/Booking.js";

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

export const bookCounsellor = async (req, res) => {
  try {
    const { userName, counsellorId, slot } = req.body;
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) return res.status(404).json({ error: "Counsellor not found" });
    if (!counsellor.availableSlots.map(s => s.toISOString()).includes(new Date(slot).toISOString())) {
      return res.status(400).json({ error: "Slot not available" });
    }
    const booking = await Booking.create({ userName, counsellor: counsellorId, slot, status: "confirmed" });
    counsellor.availableSlots = counsellor.availableSlots.filter(
      s => s.toISOString() !== new Date(slot).toISOString()
    );
    await counsellor.save();
    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("counsellor");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.counsellor.availableSlots.push(booking.slot);
    await booking.counsellor.save();
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId, newSlot } = req.body;
    const booking = await Booking.findById(bookingId).populate("counsellor");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const counsellor = booking.counsellor;
    if (!counsellor.availableSlots.map(s => s.toISOString()).includes(new Date(newSlot).toISOString())) {
      return res.status(400).json({ error: "New slot not available" });
    }
    counsellor.availableSlots.push(booking.slot);
    counsellor.availableSlots = counsellor.availableSlots.filter(
      s => s.toISOString() !== new Date(newSlot).toISOString()
    );
    await counsellor.save();
    booking.slot = newSlot;
    booking.status = "confirmed";
    await booking.save();
    res.json({ message: "Booking rescheduled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("counsellor", "name specialization contactNumber institutionName");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
