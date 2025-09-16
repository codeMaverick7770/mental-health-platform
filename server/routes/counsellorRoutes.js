import express from "express";
import { 
  getAllCounsellors,
  createCounsellor
} from "../controllers/counsellorController.js";

const router = express.Router();

router.get("/counsellors", getAllCounsellors);
router.post("/counsellors/create", createCounsellor);
export default router;
