"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.requireAuth, uploadMiddleware_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // In a real app, you'd upload to S3 and get a URL.
    // Here we return the local path.
    const imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageURL });
});
exports.default = router;
