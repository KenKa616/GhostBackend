"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvite = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    inviteToken: zod_1.z.string()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const register = async (req, res) => {
    try {
        const { email, password, name, inviteToken } = registerSchema.parse(req.body);
        // Validate invite token
        const invite = await client_1.default.inviteToken.findUnique({
            where: { token: inviteToken }
        });
        if (!invite || invite.isUsed) {
            return res.status(400).json({ error: 'Invalid or used invite token' });
        }
        // Check if user exists
        const existingUser = await client_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await client_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Mark invite as used
        await client_1.default.inviteToken.update({
            where: { id: invite.id },
            data: { isUsed: true }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const createInvite = async (req, res) => {
    try {
        // Only authenticated users can create invites (protected by middleware)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const invite = await client_1.default.inviteToken.create({
            data: {
                token
            }
        });
        res.status(201).json({ inviteLink: `https://ghosttalk.app/register?token=${invite.token}`, token: invite.token });
    }
    catch (error) {
        res.status(500).json({ error: 'Could not generate invite' });
    }
};
exports.createInvite = createInvite;
