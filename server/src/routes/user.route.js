import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
  addToHistory,
  getHistory,
  clearHistory
} from "../controllers/user.controller.js";
import { authMiddleware } from "../utils/auth.utills.js";

const router = express.Router();

// ========== PROFILE ==========
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

// ========== FAVORITES ==========
router.get("/me/favorites", authMiddleware, getFavorites);
router.post("/me/favorites/:mediaId", authMiddleware, addFavorite);
router.delete("/me/favorites/:mediaId", authMiddleware, removeFavorite);

// ========== HISTORY ==========
router.get("/me/history", authMiddleware, getHistory);
router.post("/me/history/:mediaId", authMiddleware, addToHistory);
router.delete("/me/history", authMiddleware, clearHistory);

export default router;
