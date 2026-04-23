import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware';
import { List } from '../models/List';
import { Board } from '../models/Board';
import { Card } from '../models/Card';

const router: Router = express.Router();

// Apply JWT authentication to all list routes
router.use(authenticateToken);

// Helper function to delete lists and their cards when a board is deleted
export async function deleteListsByBoardId(boardId: string): Promise<void> {
    const lists = await List.find({ boardId });
    for (const list of lists) {
        await Card.deleteMany({ listId: list._id });
    }
    await List.deleteMany({ boardId });
}

// Helper function to delete cards when a list is deleted
export async function deleteCardsByListId(listId: string): Promise<void> {
    await Card.deleteMany({ listId });
}

//GET /:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid list ID format' });
        }

        const list = await List.findById(id);
        
        if (!list) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }
        
        return res.status(200).json({ success: true, data: list });
    } catch (err) {
        console.error('Error in /api/lists/:id:', err);
        return res.status(500).json({ 
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

//GET /board/:boardId
router.get('/board/:boardId', async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({ success: false, error: 'Invalid board ID format' });
        }

        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        const boardLists = await List.find({ boardId });
        
        return res.status(200).json({ success: true, data: boardLists });
    } catch (err) {
        console.error('Error in /api/lists/board/:boardId:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

//POST /
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, boardId } = req.body;
        
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, error: 'List name is required' });
        }
        
        if (name.length < 1 || name.length > 100) {
            return res.status(400).json({ success: false, error: 'Invalid list name' });
        }
        
        if (!boardId || typeof boardId !== 'string') {
            return res.status(400).json({ success: false, error: 'Board ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({ success: false, error: 'Invalid board ID format' });
        }
        
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }
        
        const newList = new List({
            name: name.trim(),
            boardId
        });
        
        await newList.save();
        
        return res.status(201).json({ 
            success: true, 
            data: newList,
            message: 'List created successfully'
        });
    } catch (err) {
        console.error('Error in /api/lists POST:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

//PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid list ID format' });
        }

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ success: false, error: 'List name is required' });
        }

        const list = await List.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        
        if (!list) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }
        
        return res.status(200).json({
            success: true,
            data: list,
            message: 'List updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /api/lists/:id:', err);
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
            return res.status(400).json({ success: false, error: 'Invalid list ID format' });
        }

        const list = await List.findById(id);
        
        if (!list) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        await deleteCardsByListId(id);
        await List.findByIdAndDelete(id);
        
        return res.status(200).json({
            success: true,
            message: 'List deleted successfully'
        });
    } catch (err) {
        console.error('Error in DELETE /api/lists/:id:', err);
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