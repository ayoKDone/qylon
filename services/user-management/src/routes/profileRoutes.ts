import express from 'express';
import authenticate from '../middleware/authenticate';
import { verifyJWT } from '../middleware/jwt';
import {
  createUserProfile,
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../services/profileService';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

router.get('/', authenticate, verifyJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const profile = await getUserProfile(authReq.dbUser.id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

router.post('/', authenticate, verifyJWT, async (req, res) => {
  try {
    const profile = await createUserProfile(req.body);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/', authenticate, verifyJWT, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const updated = await updateUserProfile(authReq.dbUser.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/', authenticate, verifyJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  await deleteUserProfile(authReq.dbUser.id);
  res.status(200).send({ message: 'Profile deleted successfully' });
});

export default router;
