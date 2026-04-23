import express, { Request, Response, Router } from 'express';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router: Router = express.Router();

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error in /api/users/:id:', err);
    return res.status(500).json({ success: false, errors: [{ message: err instanceof Error ? err.message : 'Internal server error',  field: "internal"}]});
  }
});

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username } = req.body || {};
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    const newUser = new User({ username, password: 'temp' });
    await newUser.save();

    const { password: _, ...userResponse } = newUser.toObject();

    return res.status(201).json({ success: true, data: userResponse, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /api/users/register:', err);
    return res.status(500).json({ success: false, error: {message: err instanceof Error ? err.message : String(err), field: "internal"} });
  }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/users/:id:', err);
    return res.status(500).json({ success: false, errors: [{message: err instanceof Error ? err.message : 'Internal server error',  field: "internal"}]});
  }
});

export default router;
