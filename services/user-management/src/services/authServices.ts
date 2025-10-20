import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { pool } from '../database';
import supabase from '../supabaseClient';
import { LoginResponse, RegisterResponse, Users } from '../types';
import { logger } from '../utils/logger';

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
      return res
        .status(409)
        .json({ message: 'User already registered', user: null, session: null });
    }
    return res.status(400).json({ message: error.message, user: null, session: null });
  }

  const supabaseUser = data.user;
  const session = data.session;
  if (!supabaseUser) {
    return res.status(500).json({ message: 'Failed to create user', user: null, session: null });
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

    const user: Users = {
      id: result.rows[0].id,
      email: result.rows[0].email,
    };

    res.status(201).json({ message: 'User registered', user, session });
  } catch (dbError) {
    // If user not registered in DB then rollback
    await supabase.auth.admin.deleteUser(supabaseUser.id).catch(() => {});
    res.status(500).json({
      message: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
      user: null,
      session: null,
    });
  }
}

export async function completeOnboarding(req: Request, res: Response) {
  const { user_id, onboarding_data } = req.body;

  if (!user_id || !onboarding_data) {
    return res.status(400).json({
      message: 'User ID and onboarding data are required',
      success: false,
    });
  }

  try {
    // Update user profile with onboarding data
    const query = `
      UPDATE users
      SET
        full_name = $1,
        company_name = $2,
        industry = $3,
        company_size = $4,
        role = $5,
        timezone = $6,
        onboarding_completed = true,
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, email, full_name, company_name
    `;

    const values = [
      onboarding_data.full_name,
      onboarding_data.company_name,
      onboarding_data.industry,
      onboarding_data.company_size,
      onboarding_data.role,
      onboarding_data.timezone || 'UTC',
      user_id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        success: false,
      });
    }

    logger.info('User onboarding completed', {
      user_id,
      company: onboarding_data.company_name,
    });

    res.status(200).json({
      message: 'Onboarding completed successfully',
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to complete onboarding', { error, user_id });
    res.status(500).json({
      message: 'Failed to complete onboarding',
      success: false,
    });
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

    const user: Users | null = data.user
      ? { id: data.user.id, email: data.user.email || '' }
      : null;

    // Update last_login_at in Postgres
    if (user) {
      await pool.query('UPDATE users SET last_login_at = NOW() WHERE email = $1', [email]);
    }

    res.json({ message: 'Login successful', token, user });
  } catch (dbError) {
    res.status(500).json({
      message: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
      token: '',
      user: null,
    });
  }
}
