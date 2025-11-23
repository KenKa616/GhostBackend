import { Request, Response } from 'express';
import prisma from '../prisma/client';

interface AuthRequest extends Request {
    user?: any;
}

export const sendFollowRequest = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.targetUserId;

        if (followerId === followingId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const existingFollow = await prisma.follow.findUnique({
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

        await prisma.follow.create({
            data: {
                followerId,
                followingId,
                status: 'PENDING'
            }
        });

        res.json({ message: 'Follow request sent' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const acceptFollowRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;

        const request = await prisma.follow.findUnique({
            where: { id: requestId }
        });

        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }

        await prisma.follow.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });

        res.json({ message: 'Follow request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rejectFollowRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const requestId = req.params.requestId;

        const request = await prisma.follow.findUnique({
            where: { id: requestId }
        });

        if (!request || request.followingId !== userId) {
            return res.status(404).json({ error: 'Request not found' });
        }

        await prisma.follow.delete({
            where: { id: requestId }
        });

        res.json({ message: 'Follow request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getFollowRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;

        const requests = await prisma.follow.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
