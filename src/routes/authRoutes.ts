import express from 'express';
import { register, login, createInvite } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/invite', requireAuth, createInvite);

export default router;
