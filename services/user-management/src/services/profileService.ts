import { QueryResult } from 'pg';
import { pool } from '../database';

export interface UserProfile {
  id: string;
  full_name: string;
  company_name: string;
  role: string;
  company_size: string;
  industry: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const query = `
    SELECT id, full_name, company_name, role, company_size, industry, email
    FROM users
    WHERE id = $1
  `;
  const { rows }: QueryResult<UserProfile> = await pool.query(query, [userId]);
  return rows[0] || null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) throw new Error('No fields to update.');

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const query = `
    UPDATE users
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING id, full_name, company_name, role, company_size, industry;
  `;

  const { rows } = await pool.query(query, [...values, userId]);
  return rows[0];
}

export async function deleteUserProfile(userId: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function createUserProfile(profile: UserProfile): Promise<UserProfile> {
  const query = `
    INSERT INTO users (full_name, company_name, role, company_size, industry)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, full_name, company_name, role, company_size, industry;
  `;
  const values = [
    profile.full_name,
    profile.company_name,
    profile.role,
    profile.company_size,
    profile.industry,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}
