import express from 'express';
import request from 'supertest';
import {
  authenticateToken,
  requireClientAccess,
  requireRole,
} from '../middleware/auth';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

describe('Authentication Middleware', () => {
  let app: express.Application;
  let mockSupabaseClient: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
        refreshSession: jest.fn(),
        signOut: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    };

    // mockSupabase.mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'user',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      app.use('/test', authenticateToken, (req, res) => {
        res.json({ success: true, user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should reject request without token', async () => {
      app.use('/test', authenticateToken, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      app.use('/test', authenticateToken, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should reject inactive user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'user',
          status: 'inactive',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      app.use('/test', authenticateToken, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Account is inactive');
    });
  });

  describe('requireRole', () => {
    it('should allow access for authorized role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@example.com',
        user_metadata: {
          role: 'admin',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      app.use(
        '/test',
        authenticateToken,
        requireRole(['admin']),
        (req, res) => {
          res.json({ success: true });
        }
      );

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access for unauthorized role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {
          role: 'user',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      app.use(
        '/test',
        authenticateToken,
        requireRole(['admin']),
        (req, res) => {
          res.json({ success: true });
        }
      );

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('requireClientAccess', () => {
    it('should allow access to owned client', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'user',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'client-123', user_id: 'user-123' },
              error: null,
            })),
          })),
        })),
      });

      app.use(
        '/test/:clientId',
        authenticateToken,
        requireClientAccess,
        (req, res) => {
          res.json({ success: true });
        }
      );

      const response = await request(app)
        .get('/test/client-123')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access to non-owned client', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'user',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      });

      app.use(
        '/test/:clientId',
        authenticateToken,
        requireClientAccess,
        (req, res) => {
          res.json({ success: true });
        }
      );

      const response = await request(app)
        .get('/test/client-456')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Access denied to client');
    });
  });
});

describe('Auth Routes', () => {
  let app: express.Application;
  let mockSupabaseClient: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // app.use('/auth', authRoutes);

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn(),
    };
  });

  describe('POST /auth/validate', () => {
    it('should validate valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          role: 'user',
          status: 'active',
        },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const response = await request(app)
        .post('/auth/validate')
        .send({ token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      });
    });

    it('should reject invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const response = await request(app)
        .post('/auth/validate')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should require token in request body', async () => {
      const response = await request(app).post('/auth/validate').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Token is required');
    });
  });
});
