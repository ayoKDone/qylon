import express, { Request, Response } from 'express';
import authRoutes from './api/auth';
import { verifyJWT } from './middleware/jwt';

const app = express();
app.use(express.json());

// Auth routes
app.use('/auth', authRoutes);

// Protected route for testing JWT
app.get('/protected', verifyJWT, (req: Request, res: Response) => {
  res.json({ message: 'Protected content', user: (req as any).user });
});

export default app;
