import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware';
import { Message } from '../models/Message';

const router: Router = express.Router();

// Apply JWT authentication to all chat routes
router.use(authenticateToken);

const connections = new Map<string, Response[]>();

router.get('/stream/:username', (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ success: false, error: 'Username is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!connections.has(username)) {
        connections.set(username, []);
    }
    connections.get(username)!.push(res);

    console.log(`User ${username} connected to chat stream`);

    res.write(`data: ${JSON.stringify({ type: 'connected', username })}\n\n`);

    req.on('close', () => {
        const userConnections = connections.get(username);
        if (userConnections) {
            const index = userConnections.indexOf(res);
            if (index > -1) {
                userConnections.splice(index, 1);
            }
            if (userConnections.length === 0) {
                connections.delete(username);
            }
        }
        console.log(`User ${username} disconnected from chat stream`);
    });
});

router.post('/send', async (req: Request, res: Response) => {
    try {
        const { from, to, content } = req.body;

        if (!from || typeof from !== 'string' || !from.trim()) {
            return res.status(400).json({ success: false, error: 'Sender username is required' });
        }

        if (!to || typeof to !== 'string' || !to.trim()) {
            return res.status(400).json({ success: false, error: 'Recipient username is required' });
        }

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ success: false, error: 'Message content is required' });
        }

        const newMessage = new Message({
            from: from.trim(),
            to: to.trim(),
            content: content.trim()
        });

        await newMessage.save();

        const recipientConnections = connections.get(to.trim());
        if (recipientConnections) {
            const messageData = JSON.stringify({ type: 'message', data: newMessage });
            recipientConnections.forEach(conn => {
                conn.write(`data: ${messageData}\n\n`);
            });
        }

        const senderConnections = connections.get(from.trim());
        if (senderConnections) {
            const messageData = JSON.stringify({ type: 'sent', data: newMessage });
            senderConnections.forEach(conn => {
                conn.write(`data: ${messageData}\n\n`);
            });
        }

        return res.status(201).json({
            success: true,
            data: newMessage,
            message: 'Message sent successfully'
        });
    } catch (err) {
        console.error('Error in POST /chat/send:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

router.get('/history/:user1/:user2', async (req: Request, res: Response) => {
    try {
        const { user1, user2 } = req.params;

        if (!user1 || !user2) {
            return res.status(400).json({ success: false, error: 'Both usernames are required' });
        }

        const conversationMessages = await Message.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        }).sort({ timestamp: 1 });

        return res.status(200).json({
            success: true,
            data: conversationMessages
        });
    } catch (err) {
        console.error('Error in GET /chat/history:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

router.put('/read/:username/:fromUser', async (req: Request, res: Response) => {
    try {
        const { username, fromUser } = req.params;

        const result = await Message.updateMany(
            { to: username, from: fromUser, read: false },
            { $set: { read: true } }
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} message(s) marked as read`
        });
    } catch (err) {
        console.error('Error in PUT /chat/read:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

router.get('/conversations/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, error: 'Username is required' });
        }

        const userMessages = await Message.find({
            $or: [{ from: username }, { to: username }]
        }).sort({ timestamp: -1 });

        const conversationsMap = new Map<string, { lastMessage: any; unreadCount: number }>();

        for (const m of userMessages) {
            const otherUser = m.from === username ? m.to : m.from;
            
            if (!conversationsMap.has(otherUser)) {
                const unreadCount = await Message.countDocuments({
                    from: otherUser,
                    to: username,
                    read: false
                });

                conversationsMap.set(otherUser, { lastMessage: m, unreadCount });
            }
        }

        const conversations = Array.from(conversationsMap.entries()).map(([user, data]) => ({
            username: user,
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount
        }));

        return res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (err) {
        console.error('Error in GET /chat/conversations:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

export default router;
