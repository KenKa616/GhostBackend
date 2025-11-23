import express from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // In a real app, you'd upload to S3 and get a URL.
    // Here we return the local path.
    const imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageURL });
});

export default router;
