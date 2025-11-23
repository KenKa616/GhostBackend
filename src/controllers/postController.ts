import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

interface AuthRequest extends Request {
    user?: any;
}

const createPostSchema = z.object({
    imageURL: z.string().url(),
    caption: z.string().optional()
});

const commentSchema = z.object({
    text: z.string().min(1)
});

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { imageURL, caption } = createPostSchema.parse(req.body);

        const post = await prisma.post.create({
            data: {
                userId,
                imageURL,
                caption
            }
        });

        res.status(201).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        // Get posts from users I follow
        const posts = await prisma.post.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;

        await prisma.like.create({
            data: {
                userId,
                postId
            }
        });

        res.json({ message: 'Post liked' });
    } catch (error) {
        res.status(400).json({ error: 'Already liked or error' });
    }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;

        await prisma.like.delete({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        res.json({ message: 'Post unliked' });
    } catch (error) {
        res.status(400).json({ error: 'Not liked or error' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.postId;
        const { text } = commentSchema.parse(req.body);

        const comment = await prisma.comment.create({
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
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
