"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowRequests = exports.rejectFollowRequest = exports.acceptFollowRequest = exports.sendFollowRequest = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const sendFollowRequest = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.targetUserId;
        if (followerId === followingId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }
        const existingFollow = await client_1.default.follow.findUnique({
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
        await client_1.default.follow.create({
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
};
exports.sendFollowRequest = sendFollowRequest;
const acceptFollowRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;
        const request = await client_1.default.follow.findUnique({
            where: { id: requestId }
        });
        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }
        await client_1.default.follow.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });
        res.json({ message: 'Follow request accepted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.acceptFollowRequest = acceptFollowRequest;
const rejectFollowRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;
        const request = await client_1.default.follow.findUnique({
            where: { id: requestId }
        });
        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }
        await client_1.default.follow.delete({
            where: { id: requestId }
        });
        res.json({ message: 'Follow request rejected' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.rejectFollowRequest = rejectFollowRequest;
const getFollowRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const requests = await client_1.default.follow.findMany({
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
};
exports.getFollowRequests = getFollowRequests;
