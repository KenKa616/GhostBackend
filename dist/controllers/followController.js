"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowRequests = exports.rejectFollowRequest = exports.acceptFollowRequest = exports.sendFollowRequest = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const sendFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.targetUserId;
        if (followerId === followingId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }
        const existingFollow = yield client_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        if (existingFollow) {
            return res.status(400).json({ error: 'Request already sent or already following' });
        }
        yield client_1.default.follow.create({
            data: {
                followerId,
                followingId,
                status: 'PENDING'
            }
        });
        res.json({ message: 'Follow request sent' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendFollowRequest = sendFollowRequest;
const acceptFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;
        const request = yield client_1.default.follow.findUnique({
            where: { id: requestId }
        });
        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }
        yield client_1.default.follow.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });
        res.json({ message: 'Follow request accepted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.acceptFollowRequest = acceptFollowRequest;
const rejectFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;
        const request = yield client_1.default.follow.findUnique({
            where: { id: requestId }
        });
        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }
        yield client_1.default.follow.delete({
            where: { id: requestId }
        });
        res.json({ message: 'Follow request rejected' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.rejectFollowRequest = rejectFollowRequest;
const getFollowRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const requests = yield client_1.default.follow.findMany({
            where: {
                followingId: userId,
                status: 'PENDING'
            },
            include: {
                follower: {
                    select: { id: true, name: true, profilePhotoURL: true }
                }
            }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getFollowRequests = getFollowRequests;
