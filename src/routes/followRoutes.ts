import express from 'express';
import { sendFollowRequest, acceptFollowRequest, rejectFollowRequest, getFollowRequests } from '../controllers/followController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/:targetUserId', requireAuth, sendFollowRequest);
router.post('/accept/:requestId', requireAuth, acceptFollowRequest);
router.post('/reject/:requestId', requireAuth, rejectFollowRequest);
router.get('/requests', requireAuth, getFollowRequests);

export default router;
