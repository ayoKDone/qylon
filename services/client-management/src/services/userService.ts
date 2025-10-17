import bcrypt from 'bcrypt';
import { pool } from '../database';
import { User } from '../types';

/**
 * Creates a user record in the local Postgres database.
 * This function should be called after successfully registering a user in Supabase.
 */
export async function createLocalUser(
  email: string,
  password: string,
  full_name = '',
  company_name = '',
  industry = 'other',
  company_size = '1-10',
): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash, full_name, company_name, industry, company_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email
    `;
    const values = [email, hashedPassword, full_name, company_name, industry, company_size];

    const result = await pool.query(query, values);

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
    };
  } catch (error) {
    // Log the error for debugging
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Finds a user in the local Postgres database by email.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}
