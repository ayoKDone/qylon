import request from 'supertest';
import app from '../src/app';
import supabase from '../src/supabaseClient';

describe('Auth Routes (Supabase)', () => {
  const testEmail = 'jestuser@example.com';
  const testPassword = 'jest123456';
  let supabaseSession: string;
  let userId: string | null = null;

  // Helper to delete user if exists
  const deleteTestUser = async () => {
    if (userId) {
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
    } else {
      // Try to fetch user by email first
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error) {
        const user = data.users.find(u => u.email === testEmail);
        if (user) {
          userId = user.id;
          await supabase.auth.admin.deleteUser(userId).catch(() => {});
        }
      }
    }
  };

  beforeAll(async () => {
    await deleteTestUser();
  });

  afterAll(async () => {
    await deleteTestUser();
  });

  // REGISTER
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.user).toHaveProperty('id');
      userId = res.body.user.id;
    } else {
      expect(res.body).toHaveProperty('error');
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

  // LOGOUT
  // it('should logout user', async () => {
  //   const res = await request(app)
  //     .post('/auth/logout')
  //     .set('Authorization', `Bearer ${supabaseSession}`);

  //   expect(res.status).toBe(200);
  //   expect(res.body).toHaveProperty('message', 'Logged out successfully');
  // });
});
