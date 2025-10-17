import express from 'express';
import authenticate from '../middleware/authenticate';
import { verifyJWT } from '../middleware/jwt';
import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  updateClient,
} from '../services/clientService';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

router.get('/', verifyJWT, async (_, res) => {
  const clients = await getAllClients();
  res.json(clients);
});

router.get('/me', authenticate, verifyJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.dbUser?.id;

  if (!userId) {
    return res.status(400).json({ message: 'User Does not Exist' });
  }

  const client = await getClientById(userId);
  if (!client) {
    return res.status(404).json({ message: 'Client not found' });
  }

  res.json(client);
});

router.post('/', authenticate, verifyJWT, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const clientData = {
      name: authReq.dbUser.full_name,
      contact_email: authReq.dbUser.email,
      contact_phone: authReq.dbUser.phone_number || null,
      user_id: authReq.dbUser.id!,
      industry: authReq.body.industry || 'other',
      company_size: authReq.body.company_size || '1-10',
      settings: req.body.settings || {},
      primary_goals: req.body.primary_goals || '',
      budget: req.body.budget || 'under_5k',
      timeline: req.body.timeline || 'immediate',
    };

    const newClient = await createClient(clientData);

    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/', authenticate, verifyJWT, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const updated = await updateClient(authReq.dbUser.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/', authenticate, verifyJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  await deleteClient(authReq.dbUser.id);
  res.status(204).send();
});

export default router;
