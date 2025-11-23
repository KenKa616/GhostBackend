import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

interface AuthRequest extends Request {
    user?: any;
}

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    profilePhotoURL: z.string().url().optional()
});

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.userId;

        const user = await prisma.user.findUnique({
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
        const isFollowing = user.followers.some((f: any) => f.followerId === currentUserId);

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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const data = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data
        });

        res.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
