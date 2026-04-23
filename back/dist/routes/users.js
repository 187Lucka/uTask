"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const dataDir = path_1.default.join(__dirname, '..', 'data');
const usersFile = path_1.default.join(dataDir, 'users.json');
async function readUsers() {
    try {
        const content = await promises_1.default.readFile(usersFile, 'utf8');
        return JSON.parse(content || '[]');
    }
    catch (err) {
        return [];
    }
}
async function writeUsers(users) {
    await promises_1.default.mkdir(dataDir, { recursive: true });
    await promises_1.default.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}
// GET /:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idPattern = /^[a-fA-F0-9]{24}$|^[0-9a-z]{10,50}$/;
        if (!id || typeof id !== 'string' || !idPattern.test(id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }
        const users = await readUsers();
        const user = users.find(u => u.id === id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        console.error('Error in /api/users/:id:', err);
        return res.status(500).json({ success: false, errors: [{ message: 'Internal server error' }] });
    }
});
// POST /register
router.post('/register', async (req, res) => {
    try {
        const { username } = req.body || {};
        if (!username || typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ success: false, error: 'Username is required' });
        }
        const users = await readUsers();
        const exists = users.find(u => u.username === username);
        if (exists) {
            return res.status(409).json({ success: false, error: 'Username already exists' });
        }
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const newUser = { id, username };
        users.push(newUser);
        await writeUsers(users);
        return res.status(201).json({ success: true, data: newUser, message: 'User registered successfully' });
    }
    catch (err) {
        console.error('Error in /api/users/register:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// DELETE /:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idPattern = /^[a-fA-F0-9]{24}$|^[0-9a-z]{10,50}$/;
        if (!id || typeof id !== 'string' || !idPattern.test(id)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }
        const users = await readUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        users.splice(index, 1);
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (err) {
        console.error('Error in DELETE /api/users/:id:', err);
        return res.status(500).json({ success: false, errors: [{ message: 'Internal server error' }] });
    }
});
exports.default = router;
