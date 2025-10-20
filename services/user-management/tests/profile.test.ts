import { jest } from '@jest/globals';
import request from 'supertest';
import { pool } from '../src/database';

const testEmail = 'mockprofile@example.com';
let testUserId: string;

// ✅ Mock middleware BEFORE importing app
jest.unstable_mockModule('../src/middleware/authenticate', () => ({
  default: (req: any, _res: any, next: any) => {
    req.dbUser = {
      id: testUserId,
      email: testEmail,
      full_name: 'Mock User',
      phone_number: '0712345678',
    };
    next();
  },
}));

jest.unstable_mockModule('../src/middleware/jwt', () => ({
  verifyJWT: (req: any, _res: any, next: any) => {
    req.token = 'mock-jwt-token';
    next();
  },
}));

// ✅ Dynamic import after mocks
let app: any;
beforeAll(async () => {
  const mod = await import('../src/app');
  app = mod.default;

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, company_name, role, company_size, industry)
     VALUES ($1, 'hashedpassword', 'Mock User', 'MockCorp', 'user', '1-10', 'other')
     RETURNING id`,
    [testEmail],
  );
  testUserId = result.rows[0].id;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
  await pool.end();
});

describe('Profile Management API (Mocked JWT)', () => {
  it('should get the user profile', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testEmail);
    expect(res.body).toHaveProperty('full_name', 'Mock User');
  });

  it('should update the user profile', async () => {
    const res = await request(app).put('/profile').send({
      full_name: 'Updated Mock User',
      company_name: 'UpdatedCorp',
      role: 'admin',
      company_size: '11-50',
      industry: 'healthcare',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe('Updated Mock User');

    const check = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
    expect(check.rows[0].full_name).toBe('Updated Mock User');
  });

  it('should delete the user profile', async () => {
    const res = await request(app).delete('/profile');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Profile deleted successfully');

    const check = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
    expect(check.rowCount).toBe(0);
  });

  it('should return 404 for a deleted profile', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(404);
  });
});
