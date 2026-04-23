import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or username already exists
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Username and password are required' }]
            });
            return;
        }

        if (username.length < 3) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Username must be at least 3 characters long' }]
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Password must be at least 6 characters long' }]
            });
            return;
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Username already exists' }]
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();

        const token = generateToken(newUser._id.toString(), newUser.username);

        const { password: _, ...userResponse } = newUser.toObject();

        res.status(201).json({
            success: true,
            data: {
                ...userResponse,
                token
            },
            message: 'User registered successfully',
            errors: []
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: null,
            errors: [{ message: 'Internal server error' }]
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Username and password are required' }]
            });
            return;
        }

        const user = await User.findOne({ username });

        if (!user) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Invalid credentials' }]
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                data: null,
                message: null,
                errors: [{ message: 'Invalid credentials' }]
            });
            return;
        }

        const token = generateToken(user._id.toString(), user.username);

        const { password: _, ...userResponse } = user.toObject();

        res.status(200).json({
            success: true,
            data: {
                ...userResponse,
                token
            },
            message: 'Login successful',
            errors: []
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: null,
            errors: [{ message: 'Internal server error' }]
        });
    }
});

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify JWT token and get user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid token
 */
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };

        res.status(200).json({
            valid: true,
            user: {
                id: decoded.id,
                username: decoded.username
            }
        });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
});

export default router;