import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware';
import { Board } from '../models/Board';
import { List } from '../models/List';
import { Card } from '../models/Card';

const router: Router = express.Router();

router.use(authenticateToken);

// Helper function to delete lists and cards when a board is deleted
export async function deleteListsByBoardId(boardId: string): Promise<void> {
    const lists = await List.find({ boardId });
    for (const list of lists) {
        await Card.deleteMany({ listId: list._id });
    }
    await List.deleteMany({ boardId });
}

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid board ID format' });
        }

        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }
        return res.status(200).json({ success: true, data: board });
    } catch (err) {
        console.error('Error in /api/boards/:id:', err);
        return res.status(500).json({ 
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

// GET /user/:userId
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const userBoards = await Board.find({ userId });
        return res.status(200).json({ success: true, data: userBoards });
    } catch (err) {
        console.error('Error in /api/boards/user/:userId:', err);
        return res.status(500).json({ 
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, userId } = req.body || {};
        
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Board name is required' });
        }
        
        if (!userId || typeof userId !== 'string' || !userId.trim()) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        const newBoard = new Board({
            name: name.trim(),
            description: description?.trim(),
            userId
        });

        await newBoard.save();

        return res.status(201).json({ 
            success: true, 
            data: newBoard,
            message: 'Board created successfully'
        });
    } catch (err) {
        console.error('Error in /api/boards:', err);
        return res.status(500).json({ 
            success: false, 
            errors: [{ 
                message: err instanceof Error ? err.message : String(err), 
                field: 'internal'
            }]
        });
    }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid board ID format' });
        }

        const updateData: any = {};
        if (name && typeof name === 'string' && name.trim()) {
            updateData.name = name.trim();
        }
        if (description !== undefined && typeof description === 'string') {
            updateData.description = description.trim();
        }

        const board = await Board.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }
        
        return res.status(200).json({ 
            success: true, 
            data: board,
            message: 'Board updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /api/boards/:id:', err);
        return res.status(500).json({ 
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid board ID format' });
        }

        const board = await Board.findById(id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }
        
        await deleteListsByBoardId(id);
        await Board.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Board deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /api/boards/:id:', err);
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