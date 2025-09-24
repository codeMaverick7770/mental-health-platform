// utils/admin.utils.js
export const adminMiddleware = (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
  
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
      }
  
      next(); // ✅ user is admin, continue
    } catch (error) {
      console.error("Admin Middleware Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  