import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import followRoutes from './routes/followRoutes';
import storyRoutes from './routes/storyRoutes';
import uploadRoutes from './routes/uploadRoutes';
// import chatRoutes from './routes/chatRoutes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/follow', followRoutes);
app.use('/stories', storyRoutes);
app.use('/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));
// app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('GhostTalk Backend is running');
});

export default app;
