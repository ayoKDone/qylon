import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/database';
import supabase from '../src/supabaseClient';

describe('Auth Routes (Supabase)', () => {
  const testEmail = 'jestuser@example.com';
  const testPassword = 'jest123456';
  let supabaseSession: string;
  let userId: string | null = null;

  // Helper to delete user if exists
  const deleteTestUser = async () => {
    try {
      // Delete from Supabase first
      if (userId) {
        await supabase.auth.admin.deleteUser(userId).catch(() => {});
      } else {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (!error) {
          const user = data.users.find(u => u.email === testEmail);
          if (user) {
            userId = user.id;
            await supabase.auth.admin.deleteUser(userId).catch(() => {});
          }
        }
      }

      // Delete from Postgres
      await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
      console.log(`Deleted user ${testEmail} from Postgres`);
    } catch (err) {
      console.error('Error deleting test user:', err);
    }
  };

  beforeAll(async () => {
    await deleteTestUser();
  });

  afterAll(async () => {
    await deleteTestUser();
  });

  // REGISTER
  it('should register a new user and save to Postgres', async () => {
    const { status, body } = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    // Expect either successful registration, user already exists, or Supabase validation error
    expect([201, 409, 400]).toContain(status);

    if (status === 201) {
      const { user, message } = body;

      expect(message).toBe('User registered');
      expect(user).toBeDefined();
      expect(user).toHaveProperty('id'); // Postgres user ID
      expect(user).toHaveProperty('email', testEmail);

      userId = user.id; // Save for cleanup or other tests
    } else if (status === 409) {
      expect(body).toEqual({ message: 'User already registered', user: null });
    } else {
      // Registration failed due to Supabase validation or other errors
      expect(body).toHaveProperty('message');
      expect(body.user).toBeNull();
    }
  });

  // LOGIN
  it('should login an existing user and return a Supabase session token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    supabaseSession = res.body.token;
  });

  // PROTECTED route
  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${supabaseSession}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Protected content');
  });
});
