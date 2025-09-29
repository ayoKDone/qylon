import request from 'supertest';
import app from '../src/app.js';

describe('Auth Routes (Supabase)', () => {
  const testEmail = 'jestuser@example.com';
  const testPassword = 'jest123456';
  let jwtToken;

  // REGISTER
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    // 201 for first time, 400 if user already exists
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.user).toHaveProperty('id');
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });

  // LOGIN
  it('should login an existing user and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    jwtToken = res.body.token;
  });

  // PROTECTED route test (using your verifyJWT middleware)
  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/protected') // <-- make sure you add a test-only protected route in app.js
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Protected content');
  });

  // LOGOUT
  it('should logout user', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
  });
});
