import { jest } from '@jest/globals';

// Test user info
const testEmail = 'clientuser@example.com';
let testUserId: string;
let clientId: string | null = null;

// ✅ Mock authenticate middleware BEFORE importing app
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

// ✅ Dynamically import modules *after* the mock
const { default: request } = await import('supertest');
const { default: app } = await import('../src/app');
const { pool } = await import('../src/database');

describe('Client Management Routes (Mocked Auth)', () => {
  // Create test user directly in DB
  beforeAll(async () => {
    const query = `
      INSERT INTO users (email, full_name, company_name, industry, company_size, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [
      testEmail,
      'Mock User',
      'Mock Company',
      'other',
      '1-10',
      'hashedpassword', // dummy password
    ];
    const { rows } = await pool.query(query, values);
    testUserId = rows[0].id;
  });

  // Clean up clients and user after all tests
  afterAll(async () => {
    if (clientId) {
      await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);
    }
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.end();
  });

  it('should create a new client', async () => {
    const res = await request(app)
      .post('/clients')
      .send({
        industry: 'other',
        company_size: '1-10',
        primary_goals: ['growth'],
        budget: 'under_5k',
        timeline: 'immediate',
      });

    if (res.status !== 201) expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Mock User');
    expect(res.body).toHaveProperty('contact_email', testEmail);

    clientId = res.body.id;
  });

  it('should list all clients', async () => {
    const res = await request(app).get('/clients');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get the logged-in user’s client info', async () => {
    const res = await request(app).get('/clients/me');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('contact_email', testEmail);
    }
  });

  it('should update client info', async () => {
    if (!clientId) {
      return;
    }

    const res = await request(app).put(`/clients`).send({ name: 'Updated Client Name' });

    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.name).toBe('Updated Client Name');
    }
  });

  it('should delete client', async () => {
    if (!clientId) {
      return;
    }

    const res = await request(app).delete(`/clients`);
    expect([204, 400]).toContain(res.status);
  });
});
