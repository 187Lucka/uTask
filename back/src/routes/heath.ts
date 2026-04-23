import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/health', (req: Request, res: Response) => {
    res.json({
        "success": true,
        "message": "Task API is running"
    });
});

export default router;
