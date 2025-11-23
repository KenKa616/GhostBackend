import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import dotenv from 'dotenv';
import { startStoryCleanupJob } from './jobs/cleanupStories';

dotenv.config();

startStoryCleanupJob();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', (data) => {
        // data: { chatId, senderId, text, imageURL, postId }
        // In a real app, save to DB here.
        io.to(data.chatId).emit('receive_message', data);
    });

    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };
