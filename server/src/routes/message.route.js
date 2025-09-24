import express from "express";
import { getMessages } from "../controllers/message.controller.js";
import { authMiddleware } from "../utils/auth.utils.js";

const router = express.Router();

router.get("/:communityId", authMiddleware, getMessages);

export default router;
