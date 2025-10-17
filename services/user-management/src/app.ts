import express, { Request, Response } from 'express';
import { verifyJWT } from './middleware/jwt';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profileRoutes';

const app = express();
app.use(express.json());

// Auth routes
app.use('/auth', authRoutes);
// Profile routes
app.use('/profile', verifyJWT, profileRoutes);

// Protected route for testing JWT
app.get('/protected', verifyJWT, (req: Request, res: Response) => {
  res.json({ message: 'Protected content', user: (req as any).user });
});

export default app;
