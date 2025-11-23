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
exports.updateProfile = exports.getProfile = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().optional(),
    profilePhotoURL: zod_1.z.string().url().optional()
});
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;
        const user = yield client_1.default.user.findUnique({
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
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const data = updateProfileSchema.parse(req.body);
        const user = yield client_1.default.user.update({
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
});
exports.updateProfile = updateProfile;
