import { Request, Response, Router } from 'express';
import { loginUser, registerUser } from '../services/authServices';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  await registerUser(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await loginUser(req, res);
});

router.post('/onboarding/complete', async (req: Request, res: Response) => {
  // TODO: Implement completeOnboarding function
  res.status(501).json({ error: 'Onboarding completion not implemented yet' });
});

export default router;
