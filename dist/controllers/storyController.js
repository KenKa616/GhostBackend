"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStories = exports.createStory = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const createStorySchema = zod_1.z.object({
    imageURL: zod_1.z.string().url()
});
const createStory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { imageURL } = createStorySchema.parse(req.body);
        const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds from now
        const story = await client_1.default.story.create({
            data: {
                userId,
                imageURL,
                expiresAt
            }
        });
        res.status(201).json(story);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createStory = createStory;
const getStories = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get active stories from following
        const stories = await client_1.default.story.findMany({
            where: {
                expiresAt: { gt: new Date() },
                user: {
                    followers: {
                        some: {
                            followerId: userId,
                            status: 'ACCEPTED'
                        }
                    }
                }
            },
            include: {
                user: { select: { id: true, name: true, profilePhotoURL: true } }
            }
        });
        res.json(stories);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStories = getStories;
