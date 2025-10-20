import { NextFunction, Request, Response } from 'express';
import { pool } from '../database';
import supabase from '../supabaseClients';
import { AuthenticatedRequest } from '../types';

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email;

    if (!email) {
      res.status(400).json({ error: 'User email not found in token' });
      return;
    }

    // 🔍 Look up user in your Postgres table by email
    const query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const { rows } = await pool.query(query, [email]);
    const dbUser = rows[0];

    if (!dbUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    authReq.userId = supabaseUser.id;
    authReq.user = supabaseUser;
    authReq.dbUser = dbUser;

    next();
  } catch (err) {
    res.status(500).json({
      error: `Internal server error: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
};

export default authenticate;
