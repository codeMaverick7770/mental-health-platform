import express from "express";
import { bookByAdmin } from "../controllers/adminBookingController.js";

const router = express.Router();

router.post("/book/admin", bookByAdmin);

export default router;
