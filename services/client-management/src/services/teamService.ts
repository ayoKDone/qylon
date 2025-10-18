import { pool } from '../database';
import { TeamMember } from '../types';
import { sendInviteEmail } from '../utils/mail';

export async function inviteMember(member: TeamMember, email: string, clientName: string) {
  const query = `
    INSERT INTO client_team_members (client_id, role, invited_by, status, permissions, invited_at)
    VALUES ($1, $2, $3, 'pending', $4, NOW())
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [
    member.client_id,
    member.role,
    member.invited_by,
    member.permissions || {},
  ]);

  const inviteLink = `https://qylon.app/accept-invite/${rows[0].id}`;
  await sendInviteEmail(email, clientName, inviteLink);

  return rows[0];
}

export async function listMembers(client_id: string) {
  const { rows } = await pool.query('SELECT * FROM client_team_members WHERE client_id = $1', [
    client_id,
  ]);
  return rows;
}

export async function acceptInvite(id: string, user_id: string) {
  const query = `
    UPDATE client_team_members
    SET user_id = $1, status = 'active', accepted_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [user_id, id]);
  return rows[0];
}
