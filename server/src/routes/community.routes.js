import express from "express";
import {
  joinCommunity,
  leaveCommunity,
  banUser,
  unbanUser,
  getUserCommunities, // import new controller
  createCommunity,
  seedDefaultCommunities,
} from "../controllers/community.controller.js";
import { authMiddleware } from "../utils/auth.utils.js";

const router = express.Router();

router.get("/", authMiddleware, getUserCommunities); 
router.post("/", authMiddleware, createCommunity);
router.post("/seed-defaults", authMiddleware, seedDefaultCommunities);
router.post("/:communityId/join", authMiddleware, joinCommunity);
router.post("/:communityId/leave", authMiddleware, leaveCommunity);
router.post("/:communityId/ban/:userId", authMiddleware, banUser);
router.post("/:communityId/unban/:userId", authMiddleware, unbanUser);

export default router;
