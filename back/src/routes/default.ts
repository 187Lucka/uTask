import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
	res.json({
        "success": true,
        "message": "Welcome to Task API"
    });
});

export default router;
