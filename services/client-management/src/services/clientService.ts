import { pool } from '../database';
import { Client } from '../types';

export async function createClient(client: Client) {
  const query = `
    INSERT INTO clients (name, contact_email, contact_phone, user_id, industry, company_size, settings, primary_goals, budget, timeline)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    client.name,
    client.contact_email,
    client.contact_phone || null,
    client.user_id,
    client.industry,
    client.company_size,
    client.settings || {},
    Array.isArray(client.primary_goals) ? client.primary_goals : [],
    client.budget || 'under_5k',
    client.timeline || 'immediate',
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function getAllClients() {
  const { rows } = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
  return rows;
}

export async function getClientById(id: string) {
  const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  return rows[0];
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const query = `UPDATE clients SET ${setClause}, updated_at = NOW() WHERE user_id = $${fields.length + 1} RETURNING *`;

  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
}

export async function deleteClient(id: string) {
  await pool.query('DELETE FROM clients WHERE user_id = $1', [id]);
}
