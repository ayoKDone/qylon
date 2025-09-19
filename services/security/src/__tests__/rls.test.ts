import { createClient } from '@supabase/supabase-js';
import express from 'express';
import request from 'supertest';
import rlsRoutes from '../routes/rls';
// import { authenticateToken } from '../middleware/auth';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('RLS Routes', () => {
  let app: express.Application;
  let mockSupabaseClient: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock Supabase client
    mockSupabaseClient = {
      rpc: jest.fn(),
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    };

    mockSupabase.mockReturnValue(mockSupabaseClient);

    // Mock authentication middleware
    app.use((req, res, next) => {
      (req as any).user = { id: 'user-123' };
      next();
    });

    app.use('/rls', rlsRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /rls/policies/:table', () => {
    it('should return RLS policies for a table', async () => {
      const mockPolicies = [
        {
          policy_name: 'Users can view own meetings',
          table_name: 'meetings',
          operation: 'SELECT',
        },
      ];

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockPolicies,
        error: null,
      });

      const response = await request(app).get('/rls/policies/meetings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.table).toBe('meetings');
      expect(response.body.policies).toEqual(mockPolicies);
    });

    it('should handle RLS policy retrieval error', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const response = await request(app).get('/rls/policies/meetings');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.message).toBe('Failed to retrieve RLS policies');
    });
  });

  describe('POST /rls/test/:table', () => {
    it('should test RLS policy access for a record', async () => {
      const mockRecord = {
        id: 'record-123',
        title: 'Test Meeting',
        user_id: 'user-123',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockRecord,
              error: null,
            })),
          })),
        })),
      });

      const response = await request(app)
        .post('/rls/test/meetings')
        .send({ recordId: 'record-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.access).toBe('granted');
      expect(response.body.record).toEqual(mockRecord);
    });

    it('should deny access when RLS policy blocks access', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'Access denied' },
            })),
          })),
        })),
      });

      const response = await request(app)
        .post('/rls/test/meetings')
        .send({ recordId: 'record-456' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Access denied by RLS policy');
    });

    it('should require recordId in request body', async () => {
      const response = await request(app).post('/rls/test/meetings').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Record ID is required');
    });
  });

  describe('GET /rls/accessible/:table', () => {
    it('should return accessible records for a table', async () => {
      const mockRecords = [
        { id: 'record-1', title: 'Meeting 1' },
        { id: 'record-2', title: 'Meeting 2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          range: jest.fn(() => ({
            data: mockRecords,
            error: null,
            count: 2,
          })),
        })),
      });

      const response = await request(app).get(
        '/rls/accessible/meetings?limit=10&offset=0'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.table).toBe('meetings');
      expect(response.body.records).toEqual(mockRecords);
      expect(response.body.total).toBe(2);
      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(0);
    });

    it('should handle accessible records retrieval error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          range: jest.fn(() => ({
            data: null,
            error: { message: 'Database error' },
            count: null,
          })),
        })),
      });

      const response = await request(app).get('/rls/accessible/meetings');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.message).toBe(
        'Failed to retrieve accessible records'
      );
    });
  });

  describe('POST /rls/validate', () => {
    it('should validate RLS policy configuration', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: { valid: true },
        error: null,
      });

      const response = await request(app).post('/rls/validate').send({
        table: 'meetings',
        policy: 'Users can view own meetings',
        operation: 'SELECT',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.table).toBe('meetings');
      expect(response.body.policy).toBe('Users can view own meetings');
      expect(response.body.operation).toBe('SELECT');
    });

    it('should reject invalid RLS policy configuration', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Invalid policy syntax' },
      });

      const response = await request(app).post('/rls/validate').send({
        table: 'meetings',
        policy: 'Invalid policy',
        operation: 'SELECT',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Invalid RLS policy configuration');
      expect(response.body.details).toBe('Invalid policy syntax');
    });

    it('should require all validation parameters', async () => {
      const response = await request(app).post('/rls/validate').send({
        table: 'meetings',
        // Missing policy and operation
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe(
        'Table, policy, and operation are required'
      );
    });
  });
});
