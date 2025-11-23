"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const followRoutes_1 = __importDefault(require("./routes/followRoutes"));
const storyRoutes_1 = __importDefault(require("./routes/storyRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// import chatRoutes from './routes/chatRoutes';
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/posts', postRoutes_1.default);
app.use('/follow', followRoutes_1.default);
app.use('/stories', storyRoutes_1.default);
app.use('/upload', uploadRoutes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
// app.use('/chat', chatRoutes);
app.get('/', (req, res) => {
    res.send('GhostTalk Backend is running');
});
exports.default = app;
