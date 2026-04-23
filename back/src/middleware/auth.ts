import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
    };
}

/**
 * Middleware to verify JWT token
 * Expects token in Authorization header: "Bearer <token>" OR in query string: ?token=<token>
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // If no token in header, check query string (for SSE)
    if (!token && req.query.token) {
        token = req.query.token as string;
    }

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
        (req as AuthRequest).user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string, username: string): string => {
    return jwt.sign(
        { id: userId, username },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};
