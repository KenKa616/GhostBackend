import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:id', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

export default router;
