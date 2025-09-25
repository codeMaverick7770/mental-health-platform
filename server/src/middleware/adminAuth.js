import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import AdminCollege from '../models/AdminCollege.js';

export const adminAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Unauthorized' });

    let college = null;
    if (user.collegeId) {
      college = await AdminCollege.findById(user.collegeId);
      if (!college || !college.isActive) return res.status(403).json({ message: 'College is inactive' });
    }

    req.admin = {
      id: user._id.toString(),
      role: user.role,
      collegeId: user.collegeId ? user.collegeId.toString() : null,
      email: user.email,
      name: user.name,
    };
    req.college = college;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const adminAuthorize = (...allowed) => (req, res, next) => {
  if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });
  if (!allowed.includes(req.admin.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

export const scopeToAdminCollege = (getCollegeId) => (req, res, next) => {
  const userCollegeId = req.admin?.collegeId;
  const targetCollegeId = typeof getCollegeId === 'function' ? getCollegeId(req) : getCollegeId;
  if (!userCollegeId || !targetCollegeId) return res.status(400).json({ message: 'College scope missing' });
  if (String(userCollegeId) !== String(targetCollegeId)) return res.status(403).json({ message: 'Cross-college access denied' });
  next();
};

export const requireIngestKey = (req, res, next) => {
  const key = req.header('x-ingest-key');
  if (!process.env.INGEST_API_KEY) return res.status(500).json({ message: 'Ingest key not configured' });
  if (!key || key !== process.env.INGEST_API_KEY) return res.status(401).json({ message: 'Invalid ingest key' });
  next();
};
