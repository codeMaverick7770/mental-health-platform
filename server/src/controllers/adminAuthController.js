import crypto from 'crypto';
import AdminCollege from '../models/AdminCollege.js';
import AdminUser from '../models/AdminUser.js';
import AdminCounselor from '../models/AdminCounselor.js';
import AdminInvite from '../models/AdminInvite.js';
import { signAdminToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';

const normalizeDomain = (d) => String(d || '').toLowerCase().trim();
const extractDomain = (email) => String(email.split('@')[1] || '').toLowerCase();

export const registerCollege = async (req, res) => {
  try {
    const { name, domain, code, adminName, adminEmail, adminPhone, verificationMethod = 'email' } = req.body;
    if (!name || !domain || !code || !adminName || !adminEmail) return res.status(400).json({ message: 'Missing required fields' });

    const normDomain = normalizeDomain(domain);
    const normCode = String(code).toUpperCase().trim();

    const exists = await AdminCollege.findOne({ $or: [{ domain: normDomain }, { code: normCode }] });
    if (exists) return res.status(400).json({ message: 'College with same domain or code already exists' });

    // Email domain check for admin
    if (extractDomain(adminEmail) !== normDomain) {
      return res.status(400).json({ message: 'Admin email must match college domain' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const college = await AdminCollege.create({
      name,
      domain: normDomain,
      code: normCode,
      adminName,
      adminEmail: adminEmail.toLowerCase(),
      adminPhone,
      verification: { method: verificationMethod, status: 'pending', token },
    });

    // Create a temporary admin user with random password; require reset after verification
    const tempPass = crypto.randomBytes(10).toString('base64url') + '!Aa1';
    await AdminUser.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: tempPass,
      role: 'admin',
      collegeId: college._id,
    });

    // Send verification email (stub)
    await sendEmail({
      to: adminEmail,
      subject: 'Verify your college domain',
      text: `Use this code to verify your college domain: ${token}`,
    });

    return res.status(201).json({ message: 'College registered. Verification pending. Check email for code.', collegeId: college._id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const verifyCollege = async (req, res) => {
  try {
    const { domain, token } = req.body;
    const normDomain = normalizeDomain(domain);
    const college = await AdminCollege.findOne({ domain: normDomain });
    if (!college) return res.status(404).json({ message: 'College not found' });

    if (college.verification?.token !== token) return res.status(400).json({ message: 'Invalid token' });

    college.verification.status = 'verified';
    college.verification.verifiedAt = new Date();
    await college.save();

    return res.json({ message: 'College verified successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Verification failed' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

    const token = signAdminToken({ id: user._id, role: user.role, collegeId: user.collegeId });
    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ token, user: { id: user._id, email: user.email, role: user.role, collegeId: user.collegeId || null } });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const inviteCounselor = async (req, res) => {
  try {
    // Only admin can invite within their college
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const domain = extractDomain(email);
    const college = await AdminCollege.findById(req.admin.collegeId);
    if (!college) return res.status(404).json({ message: 'College not found' });
    if (domain !== college.domain) return res.status(400).json({ message: 'Email domain must match college domain' });

    const token = crypto.randomBytes(22).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await AdminInvite.create({ email: email.toLowerCase(), role: 'counselor', collegeId: college._id, token, expiresAt });

    await sendEmail({ to: email, subject: 'Counselor invite', text: `Use this code to register: ${token}` });

    return res.status(201).json({ message: 'Invite sent' });
  } catch (e) {
    return res.status(500).json({ message: 'Invite failed' });
  }
};

export const registerCounselorViaInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    const invite = await AdminInvite.findOne({ token });
    if (!invite) return res.status(400).json({ message: 'Invalid token' });
    if (invite.usedAt) return res.status(400).json({ message: 'Token already used' });
    if (invite.expiresAt < new Date()) return res.status(400).json({ message: 'Token expired' });

    const email = invite.email.toLowerCase();
    const existing = await AdminCounselor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const counselor = await AdminCounselor.create({
      name: name || email.split('@')[0],
      email,
      password,
      collegeId: invite.collegeId,
    });

    invite.usedAt = new Date();
    await invite.save();

    return res.status(201).json({ id: counselor._id, email: counselor.email, role: 'counselor', collegeId: counselor.collegeId });
  } catch (e) {
    return res.status(500).json({ message: 'Counselor registration failed' });
  }
};

// Admin sets initial password using the same domain verification token
// This avoids printing temporary passwords to logs/emails
export const adminSetInitialPassword = async (req, res) => {
  try {
    const { email, domain, token, newPassword } = req.body;
    if (!email || !domain || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normDomain = normalizeDomain(domain);
    const college = await AdminCollege.findOne({ domain: normDomain });
    if (!college) return res.status(404).json({ message: 'College not found' });
    if ((college.verification?.status || 'pending') !== 'verified') {
      return res.status(400).json({ message: 'College not verified' });
    }
    if (college.verification?.token !== token) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase(), role: 'admin', collegeId: college._id });
    if (!user) return res.status(404).json({ message: 'Admin user not found' });

    // Set new password (hook will hash on save)
    user.password = newPassword;
    await user.save();

    // Invalidate token after successful password set
    college.verification.token = undefined;
    await college.save();

    return res.json({ message: 'Password set successfully. Please login.' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to set password' });
  }
};
