"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStoryCleanupJob = void 0;
// @ts-nocheck
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = __importDefault(require("../prisma/client"));
const startStoryCleanupJob = () => {
    // Run every minute (or every 30 seconds if needed, but cron min resolution is 1 min usually, for seconds use '*/30 * * * * *')
    node_cron_1.default.schedule('*/30 * * * * *', async () => {
        try {
            const now = new Date();
            const result = await client_1.default.story.deleteMany({
                where: {
                    expiresAt: { lt: now }
                }
            });
            if (result.count > 0) {
                console.log(`Deleted ${result.count} expired stories`);
            }
        }
        catch (error) {
            console.error('Error cleaning up stories:', error);
        }
    });
};
exports.startStoryCleanupJob = startStoryCleanupJob;
