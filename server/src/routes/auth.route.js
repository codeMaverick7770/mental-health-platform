import express from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  requestDeleteAccount,
  confirmDeleteAccount
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../utils/auth.utills.js";
import { sendOtpEmail } from "../utils/email.utils.js"; // ✅ import your OTP sender

const router = express.Router();

// ========== AUTH ROUTES ==========
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);


// ========== PASSWORD MANAGEMENT ==========
router.post("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


// ========== ACCOUNT DELETION ==========
router.post("/request-delete", authMiddleware, requestDeleteAccount);
router.post("/confirm-delete", confirmDeleteAccount);


// ========== DUMMY TEST ROUTE ==========
router.get("/test-otp-email", async (req, res) => {
  try {
    const dummyEmail = "shubhamty06@gmail.com"; // replace with your email
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOtpEmail(dummyEmail, dummyOtp);

    res.status(200).json({
      success: true,
      message: `Test OTP email sent to ${dummyEmail}`,
      otp: dummyOtp // just to see it in response (remove in prod)
    });
  } catch (error) {
    console.error("Test OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send test OTP email" });
  }
});

export default router;
