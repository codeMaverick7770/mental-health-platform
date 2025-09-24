import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import { sendOtpEmail } from "../utils/email.utils.js";

// =================== REGISTER ===================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user with isVerified = false
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false
    });
    await newUser.save();

    // 4. Generate OTP and upsert (reset expiry if exists)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = await Otp.findOneAndUpdate(
      { email, purpose: "register" },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Send OTP
    await sendOtpEmail(email, otpRecord.otp);

    res.status(201).json({
      success: true,
      message: "User registered. Please verify with OTP sent to your email."
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error, please try again" });
  }
};

// =================== VERIFY EMAIL VIA OTP ===================
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp, purpose: "register" });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    // remove otp
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== LOGIN ===================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== LOGOUT ===================
export const logout = async (req, res) => {
  try {
    // Stateless JWT: instruct client to delete token.
    // If you need server-side invalidation, implement a token blacklist.
    res.status(200).json({
      success: true,
      message: "Logged out successfully. Please remove token on client side."
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== CHANGE PASSWORD ===================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // JWT middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== FORGOT PASSWORD (SEND OTP) ===================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // upsert OTP (reuse existing within TTL or reset it)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = await Otp.findOneAndUpdate(
      { email, purpose: "resetPassword" },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otpRecord.otp);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== RESET PASSWORD ===================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email, otp, purpose: "resetPassword" });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =================== DELETE ACCOUNT (OTP BASED) ===================
export const requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = await Otp.findOneAndUpdate(
      { email: user.email, purpose: "deleteAccount" },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(user.email, otpRecord.otp);

    res.status(200).json({ success: true, message: "OTP sent to email for account deletion" });
  } catch (error) {
    console.error("Request Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const confirmDeleteAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp, purpose: "deleteAccount" });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await User.findOneAndDelete({ email });
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Confirm Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
