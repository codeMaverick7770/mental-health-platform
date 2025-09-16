import express from "express";
import { 
  bookCounsellor, 
  getAllBookings, 
  cancelBooking, 
  rescheduleBooking 
} from "../controllers/bookingControllers.js";

const router = express.Router();

router.post("/book", bookCounsellor);
router.post("/cancel", cancelBooking);
router.post("/reschedule", rescheduleBooking);
router.get("/bookings", getAllBookings);

export default router;
