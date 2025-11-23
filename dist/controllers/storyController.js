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
exports.getStories = exports.createStory = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const createStorySchema = zod_1.z.object({
    imageURL: zod_1.z.string().url()
});
const createStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { imageURL } = createStorySchema.parse(req.body);
        const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds from now
        const story = yield client_1.default.story.create({
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
});
exports.createStory = createStory;
const getStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Get active stories from following
        const stories = yield client_1.default.story.findMany({
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
});
exports.getStories = getStories;
