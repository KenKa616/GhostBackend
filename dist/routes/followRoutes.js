"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const followController_1 = require("../controllers/followController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/:targetUserId', authMiddleware_1.requireAuth, followController_1.sendFollowRequest);
router.post('/accept/:requestId', authMiddleware_1.requireAuth, followController_1.acceptFollowRequest);
router.post('/reject/:requestId', authMiddleware_1.requireAuth, followController_1.rejectFollowRequest);
router.get('/requests', authMiddleware_1.requireAuth, followController_1.getFollowRequests);
exports.default = router;
