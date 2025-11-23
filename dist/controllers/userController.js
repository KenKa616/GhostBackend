"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().optional(),
    profilePhotoURL: zod_1.z.string().url().optional()
});
const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                profilePhotoURL: true,
                isPrivate: true,
                createdAt: true,
                lastSeen: true,
                followers: { select: { followerId: true } },
                following: { select: { followingId: true } }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isSelf = userId === currentUserId;
        const isFollowing = user.followers.some((f) => f.followerId === currentUserId);
        if (isSelf || isFollowing) {
            return res.json(user);
        }
        // Private profile view
        res.json({
            id: user.id,
            name: user.name,
            profilePhotoURL: user.profilePhotoURL,
            isPrivate: true,
            message: 'This profile is private'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = updateProfileSchema.parse(req.body);
        const user = await client_1.default.user.update({
            where: { id: userId },
            data
        });
        res.json(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
