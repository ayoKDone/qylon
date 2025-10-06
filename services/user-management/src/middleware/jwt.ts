import { NextFunction, Request, Response } from 'express';
import supabase from '../supabaseClient';
import { User } from '../types';

interface AuthRequest extends Request {
  user?: User;
}

export async function verifyJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user)
    return res.status(403).json({ error: 'Invalid or expired token' });

  req.user = { id: data.user.id, email: data.user.email || '' };
  next();
}
