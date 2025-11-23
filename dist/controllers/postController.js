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
exports.addComment = exports.unlikePost = exports.likePost = exports.getFeed = exports.createPost = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const createPostSchema = zod_1.z.object({
    imageURL: zod_1.z.string().url(),
    caption: zod_1.z.string().optional()
});
const commentSchema = zod_1.z.object({
    text: zod_1.z.string().min(1)
});
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { imageURL, caption } = createPostSchema.parse(req.body);
        const post = yield client_1.default.post.create({
            data: {
                userId,
                imageURL,
                caption
            }
        });
        res.status(201).json(post);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createPost = createPost;
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Get posts from users I follow
        const posts = yield client_1.default.post.findMany({
            where: {
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
                user: {
                    select: { id: true, name: true, profilePhotoURL: true }
                },
                likes: true,
                comments: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getFeed = getFeed;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        yield client_1.default.like.create({
            data: {
                userId,
                postId
            }
        });
        res.json({ message: 'Post liked' });
    }
    catch (error) {
        res.status(400).json({ error: 'Already liked or error' });
    }
});
exports.likePost = likePost;
const unlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        yield client_1.default.like.delete({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });
        res.json({ message: 'Post unliked' });
    }
    catch (error) {
        res.status(400).json({ error: 'Not liked or error' });
    }
});
exports.unlikePost = unlikePost;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        const { text } = commentSchema.parse(req.body);
        const comment = yield client_1.default.comment.create({
            data: {
                userId,
                postId,
                text
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });
        res.status(201).json(comment);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.addComment = addComment;
