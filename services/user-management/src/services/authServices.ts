import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { pool } from '../database';
import supabase from '../supabaseClient';
import { LoginResponse, RegisterResponse, User } from '../types';

export async function registerUser(req: Request, res: Response<RegisterResponse>) {
  const {
    email,
    password,
    full_name = '',
    company_name = '',
    industry = 'other',
    company_size = '1-10',
  } = req.body;

  // Create the user in Supabase
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Check if user already exists
    if (error.message.includes('already registered')) {
      return res.status(409).json({ message: 'User already registered', user: null });
    }
    return res.status(400).json({ message: error.message, user: null });
  }

  const supabaseUser = data.user;
  if (!supabaseUser) {
    return res.status(500).json({ message: 'Failed to create user', user: null });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const query = `
      INSERT INTO users (email, password_hash, full_name, company_name, industry, company_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email
    `;
    const values = [email, hashedPassword, full_name, company_name, industry, company_size];
    const result = await pool.query(query, values);

    const user: User = {
      id: result.rows[0].id,
      email: result.rows[0].email,
    };

    res.status(201).json({ message: 'User registered', user });
  } catch (dbError) {
    console.error('Failed to save user to Postgres:', dbError);
    // If user not registered in DB then rollback
    await supabase.auth.admin.deleteUser(supabaseUser.id).catch(() => {});
    res.status(500).json({ message: 'Database error', user: null });
  }
}

export async function loginUser(req: Request, res: Response<LoginResponse>) {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message, token: '', user: null });
    }

    const token = data.session?.access_token || '';

    const user: User | null = data.user ? { id: data.user.id, email: data.user.email || '' } : null;

    // Update last_login_at in Postgres
    if (user) {
      await pool.query('UPDATE users SET last_login_at = NOW() WHERE email = $1', [email]);
    }

    res.json({ message: 'Login successful', token, user });
  } catch (dbError) {
    console.error('Failed to update last_login_at:', dbError);
    res.status(500).json({ message: 'Database error', token: '', user: null });
  }
}
