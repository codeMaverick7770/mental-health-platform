import { Router } from 'express';
import { adminAuthenticate, adminAuthorize } from '../middleware/adminAuth.js';
import { registerCollege, verifyCollege, loginAdmin, inviteCounselor, registerCounselorViaInvite, adminSetInitialPassword } from '../controllers/adminAuthController.js';

const router = Router();

// Public
router.post('/register-college', registerCollege);
router.post('/verify-college', verifyCollege);
router.post('/login', loginAdmin);
router.post('/counselor/register', registerCounselorViaInvite);
router.post('/admin-set-password', adminSetInitialPassword);

// Protected
router.post('/invite-counselor', adminAuthenticate, adminAuthorize('admin', 'superadmin'), inviteCounselor);

export default router;
