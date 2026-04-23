import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware';
import { Card } from '../models/Card';
import { List } from '../models/List';

const router: Router = express.Router();

router.use(authenticateToken);

// Helper functions for cascade deletion
export async function deleteCardsByListId(listId: string): Promise<void> {
    await Card.deleteMany({ listId });
}

export async function deleteCardsByBoardId(boardId: string): Promise<void> {
    const lists = await List.find({ boardId });
    const listIds = lists.map(l => l._id.toString());
    await Card.deleteMany({ listId: { $in: listIds } });
}

//GET /:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid card ID format' });
        }

        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }
        return res.status(200).json({ success: true, data: card });
    } catch (err) {
        console.error('Error in /api/cards/:id:', err);
        return res.status(500).json({
            success: false,
            errors: [{
                message: err instanceof Error ? err.message : String(err),
                field: 'internal'
            }]
        });
    }
});

// GET /list/:listId
router.get('/list/:listId', async (req: Request, res: Response) => {
    try {
        const { listId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(listId)) {
            return res.status(400).json({ success: false, error: 'Invalid list ID format' });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        const cards = await Card.find({ listId });
        
        return res.status(200).json({ success: true, data: cards });
    } catch (err) {
        console.error('Error in /api/cards/list/:listId:', err);
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
        const { title, description, listId, dueDate } = req.body;
        
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ success: false, error: 'Card title is required' });
        }
        
        if (!listId || typeof listId !== 'string') {
            return res.status(400).json({ success: false, error: 'List ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(listId)) {
            return res.status(400).json({ success: false, error: 'Invalid list ID format' });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ success: false, error: 'List not found' });
        }

        const newCard = new Card({
            title: title.trim(),
            description: description || '',
            listId,
            dueDate: dueDate || new Date().toISOString()
        });

        await newCard.save();
        
        return res.status(201).json({ 
            success: true, 
            data: newCard,
            message: 'Card created successfully'
        });
    } catch (err) {
        console.error('Error in POST /api/cards:', err);
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
        const { title, description, listId, dueDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid card ID format' });
        }

        const updateData: any = {};
        
        if (title && typeof title === 'string' && title.trim()) {
            updateData.title = title.trim();
        }

        if (description !== undefined && typeof description === 'string') {
            updateData.description = description.trim();
        }

        if (listId && typeof listId === 'string' && mongoose.Types.ObjectId.isValid(listId)) {
            updateData.listId = listId;
        }

        if (dueDate !== undefined && typeof dueDate === 'string') {
            updateData.dueDate = dueDate.trim();
        }

        const card = await Card.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!card) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }
        
        return res.status(200).json({ 
            success: true, 
            data: card,
            message: 'Card updated successfully'
        });
    } catch (err) {
        console.error('Error in PUT /api/cards/:id:', err);
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
            return res.status(400).json({ success: false, error: 'Invalid card ID format' });
        }

        const card = await Card.findByIdAndDelete(id);
        
        if (!card) {
            return res.status(404).json({ success: false, error: 'Card not found' });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: 'Card deleted successfully' 
        });
    } catch (err) {
        console.error('Error in DELETE /api/cards/:id:', err);
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