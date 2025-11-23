import express from 'express';
import { createStory, getStories } from '../controllers/storyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', requireAuth, createStory);
router.get('/', requireAuth, getStories);

export default router;
