// @ts-nocheck
import cron from 'node-cron';
import prisma from '../prisma/client';

export const startStoryCleanupJob = () => {
    // Run every minute (or every 30 seconds if needed, but cron min resolution is 1 min usually, for seconds use '*/30 * * * * *')
    cron.schedule('*/30 * * * * *', async () => {
        try {
            const now = new Date();
            const result = await prisma.story.deleteMany({
                where: {
                    expiresAt: { lt: now }
                }
            });
            if (result.count > 0) {
                console.log(`Deleted ${result.count} expired stories`);
            }
        } catch (error) {
            console.error('Error cleaning up stories:', error);
        }
    });
};
