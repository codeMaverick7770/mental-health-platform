import express from "express";
import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia
} from "../controllers/media.controller.js";
import { authMiddleware } from "../utils/auth.utils.js";
import { adminMiddleware } from "../utils/admin.utils.js";

const router = express.Router();

// Public routes
router.get("/", getAllMedia);
router.get("/:id", getMediaById);

// Admin-only routes
router.post("/", authMiddleware, adminMiddleware, createMedia);
router.put("/:id", authMiddleware, adminMiddleware, updateMedia);
router.delete("/:id", authMiddleware, adminMiddleware, deleteMedia);

export default router;
