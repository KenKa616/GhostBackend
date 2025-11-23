import express from 'express';
import { createPost, getFeed, likePost, unlikePost, addComment } from '../controllers/postController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', requireAuth, createPost);
router.get('/feed', requireAuth, getFeed);
router.post('/:postId/like', requireAuth, likePost);
router.delete('/:postId/like', requireAuth, unlikePost);
router.post('/:postId/comment', requireAuth, addComment);

export default router;
