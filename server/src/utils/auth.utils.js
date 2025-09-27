import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AdminCollege from "../models/AdminCollege.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with populated college info
    const user = await User.findById(decoded.id)
      .select("-password -refreshToken")
      .populate({
        path: "college",
        select: "_id name domain code"
      });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }


    // Attach user info to request, using adminCollege for clarity
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      domain: user.domain,
      adminCollege: user.college?._id || null,
      adminCollegeDomain: user.college?.domain || null,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
