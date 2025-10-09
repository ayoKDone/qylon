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
  await completeOnboarding(req, res);
});

export default router;
