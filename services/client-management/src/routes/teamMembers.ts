import express from 'express';
import authenticate from '../middleware/authenticate';
import { verifyJWT } from '../middleware/jwt';

import { acceptInvite, inviteMember, listMembers } from '../services/teamService';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

router.get('/members', authenticate, verifyJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.dbUser?.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const members = await listMembers(authReq.dbUser.id);
  res.json(members);
});

router.post('/invite', async (req, res) => {
  try {
    const { member, email, clientName } = req.body;
    const invited = await inviteMember(member, email, clientName);
    res.status(201).json(invited);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/accept', authenticate, verifyJWT, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { inviteId } = req.body;
    const accepted = await acceptInvite(inviteId, authReq.dbUser.id);
    res.json(accepted);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
