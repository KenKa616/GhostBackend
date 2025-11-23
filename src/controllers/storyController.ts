// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

interface AuthRequest extends Request {
    user?: any;
}

const createStorySchema = z.object({
    imageURL: z.string().url()
});

export const createStory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { imageURL } = createStorySchema.parse(req.body);

        const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds from now

        const story = await prisma.story.create({
            data: {
                userId,
                imageURL,
                expiresAt
            }
        });

        res.status(201).json(story);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getStories = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        // Get active stories from following
        const stories = await prisma.story.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
