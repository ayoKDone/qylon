import { Request, Response } from 'express';
import supabase from '../supabaseClient';
import { LoginResponse, RegisterResponse, User } from '../types';

export async function registerUser(
  req: Request,
  res: Response<RegisterResponse>
) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error)
    return res.status(400).json({ message: error.message, user: null });

  const user: User | null = data.user
    ? { id: data.user.id, email: data.user.email || '' }
    : null;

  res.status(201).json({ message: 'User registered', user });
}

export async function loginUser(req: Request, res: Response<LoginResponse>) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    return res
      .status(401)
      .json({ message: error.message, token: '', user: null });

  const token = data.session?.access_token || '';

  const user: User | null = data.user
    ? { id: data.user.id, email: data.user.email || '' }
    : null;

  res.json({ message: 'Login successful', token, user });
}
