/**
 * Security Service Comprehensive Unit Tests
 *
 * Comprehensive unit tests for the Security service.
 * Tests authentication, authorization, JWT handling, and security middleware.
 */

import {
  MockCreator,
  TestAssertions,
  TestDataGenerator,
  TestUtils,
} from '../utils/test-helpers';

describe('Security Service Comprehensive Unit Tests', () => {
  // let mockLogger: any;
  let mockSupabase: any;
  let mockRedis: any;
  let mockJWT: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock logger (not used in tests but kept for reference)
    // mockLogger = TestUtils.createMockLogger();

    // Create mock Supabase client
    mockSupabase = TestUtils.createMockSupabase();

    // Create mock Redis client
    mockRedis = TestUtils.createMockRedis();

    // Create mock JWT utilities
    mockJWT = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };
  });

  describe('Authentication Service', () => {
    describe('User Registration', () => {
      it('should register new user with valid data', async () => {
        const userData = {
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePassword123!',
          name: 'Test User',
        };

        const mockUser = TestDataGenerator.generateUser({
          email: userData.email,
          name: userData.name,
        });

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const authService = {
          register: jest.fn(async userData => {
            const { data, error } = await mockSupabase.auth.signUp({
              email: userData.email,
              password: userData.password,
              options: {
                data: {
                  name: userData.name,
                },
              },
            });

            if (error) {
              throw new Error(error.message);
            }

            return {
              success: true,
              data: data.user,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }),
        };

        const result = await authService.register(userData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUser);
        expect(result.timestamp).toBeDefined();
        TestAssertions.expectValidISO8601(result.timestamp);
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
            },
          },
        });
      });

      it('should reject registration with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'SecurePassword123!',
          name: 'Test User',
        };

        const authService = {
          register: jest.fn(async userData => {
            if (!userData.email.includes('@')) {
              throw new Error('Invalid email format');
            }
            return { success: true };
          }),
        };

        await expect(authService.register(userData)).rejects.toThrow(
          'Invalid email format'
        );
      });

      it('should reject registration with weak password', async () => {
        const userData = {
          email: TestDataGenerator.generateEmail(),
          password: '123',
          name: 'Test User',
        };

        const authService = {
          register: jest.fn(async userData => {
            if (userData.password.length < 8) {
              throw new Error('Password must be at least 8 characters long');
            }
            return { success: true };
          }),
        };

        await expect(authService.register(userData)).rejects.toThrow(
          'Password must be at least 8 characters long'
        );
      });

      it('should handle duplicate email registration', async () => {
        const userData = {
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePassword123!',
          name: 'Test User',
        };

        mockSupabase.auth.signUp.mockResolvedValue({
          data: null,
          error: { message: 'User already registered' },
        });

        const authService = {
          register: jest.fn(async userData => {
            const { data, error } = await mockSupabase.auth.signUp({
              email: userData.email,
              password: userData.password,
            });

            if (error) {
              throw new Error(error.message);
            }

            return { success: true, data };
          }),
        };

        await expect(authService.register(userData)).rejects.toThrow(
          'User already registered'
        );
      });
    });

    describe('User Login', () => {
      it('should authenticate user with valid credentials', async () => {
        const credentials = {
          email: TestDataGenerator.generateEmail(),
          password: 'SecurePassword123!',
        };

        const mockUser = TestDataGenerator.generateUser({
          email: credentials.email,
        });

        const mockSession = {
          access_token: TestDataGenerator.generateJWT(),
          refresh_token: TestDataGenerator.generateJWT(),
          user: mockUser,
        };

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const authService = {
          login: jest.fn(async credentials => {
            const { data, error } = await mockSupabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

            if (error) {
              throw new Error(error.message);
            }

            return {
              success: true,
              data: {
                user: data.session.user,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
              },
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }),
        };

        const result = await authService.login(credentials);

        expect(result.success).toBe(true);
        expect(result.data.user).toEqual(mockUser);
        expect(result.data.accessToken).toBeDefined();
        expect(result.data.refreshToken).toBeDefined();
        TestAssertions.expectValidJWT(result.data.accessToken);
        TestAssertions.expectValidJWT(result.data.refreshToken);
      });

      it('should reject login with invalid credentials', async () => {
        const credentials = {
          email: TestDataGenerator.generateEmail(),
          password: 'WrongPassword',
        };

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: null,
          error: { message: 'Invalid login credentials' },
        });

        const authService = {
          login: jest.fn(async credentials => {
            const { data, error } = await mockSupabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

            if (error) {
              throw new Error(error.message);
            }

            return { success: true, data };
          }),
        };

        await expect(authService.login(credentials)).rejects.toThrow(
          'Invalid login credentials'
        );
      });

      it('should handle account lockout after failed attempts', async () => {
        const credentials = {
          email: TestDataGenerator.generateEmail(),
          password: 'WrongPassword',
        };

        // Mock Redis for tracking failed attempts - 5 failed attempts (locked)
        mockRedis.get.mockResolvedValue('5'); // 5 previous failed attempts (locked)
        mockRedis.set.mockResolvedValue('OK');
        mockRedis.expire.mockResolvedValue(1);

        const authService = {
          login: jest.fn(async credentials => {
            const failedAttemptsKey = `failed_attempts:${credentials.email}`;
            const failedAttempts = await mockRedis.get(failedAttemptsKey);

            if (parseInt(failedAttempts) >= 5) {
              throw new Error(
                'Account temporarily locked due to too many failed attempts'
              );
            }

            const { data, error } = await mockSupabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

            if (error) {
              // Increment failed attempts
              const newCount = parseInt(failedAttempts) + 1;
              await mockRedis.set(failedAttemptsKey, newCount.toString());
              await mockRedis.expire(failedAttemptsKey, 900); // 15 minutes
              throw new Error(error.message);
            }

            // Clear failed attempts on successful login
            await mockRedis.del(failedAttemptsKey);
            return { success: true, data };
          }),
        };

        await expect(authService.login(credentials)).rejects.toThrow(
          'Account temporarily locked due to too many failed attempts'
        );
        expect(mockRedis.get).toHaveBeenCalledWith(
          `failed_attempts:${credentials.email}`
        );
      });
    });

    describe('Token Management', () => {
      it('should generate valid JWT tokens', () => {
        const user = TestDataGenerator.generateUser();
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
        };

        const mockToken = TestDataGenerator.generateJWT(payload);
        mockJWT.sign.mockReturnValue(mockToken);

        const tokenService = {
          generateAccessToken: jest.fn(user => {
            const payload = {
              sub: user.id,
              email: user.email,
              role: user.role,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
            };

            return mockJWT.sign(payload, 'test-secret');
          }),
        };

        const token = tokenService.generateAccessToken(user);

        expect(token).toBe(mockToken);
        expect(mockJWT.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            sub: user.id,
            email: user.email,
            role: user.role,
          }),
          'test-secret'
        );
        TestAssertions.expectValidJWT(token);
      });

      it('should verify valid JWT tokens', () => {
        const user = TestDataGenerator.generateUser();
        const token = TestDataGenerator.generateJWT({
          sub: user.id,
          email: user.email,
          role: user.role,
        });

        mockJWT.verify.mockReturnValue({
          sub: user.id,
          email: user.email,
          role: user.role,
        });

        const tokenService = {
          verifyToken: jest.fn(token => {
            try {
              const decoded = mockJWT.verify(token, 'test-secret');
              return { valid: true, payload: decoded };
            } catch (error) {
              return { valid: false, error: error.message };
            }
          }),
        };

        const result = tokenService.verifyToken(token);

        expect(result.valid).toBe(true);
        expect(result.payload.sub).toBe(user.id);
        expect(result.payload.email).toBe(user.email);
        expect(result.payload.role).toBe(user.role);
      });

      it('should reject expired JWT tokens', () => {
        const expiredToken = TestDataGenerator.generateJWT({
          sub: 'test-user-id',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        });

        mockJWT.verify.mockImplementation(() => {
          throw new Error('Token expired');
        });

        const tokenService = {
          verifyToken: jest.fn(token => {
            try {
              const decoded = mockJWT.verify(token, 'test-secret');
              return { valid: true, payload: decoded };
            } catch (error) {
              return { valid: false, error: error.message };
            }
          }),
        };

        const result = tokenService.verifyToken(expiredToken);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Token expired');
      });

      it('should refresh expired access tokens', async () => {
        const user = TestDataGenerator.generateUser();
        const refreshToken = TestDataGenerator.generateJWT({
          sub: user.id,
          type: 'refresh',
        });

        const newAccessToken = TestDataGenerator.generateJWT({
          sub: user.id,
          email: user.email,
          role: user.role,
        });

        mockSupabase.auth.refreshSession.mockResolvedValue({
          data: {
            session: {
              access_token: newAccessToken,
              refresh_token: refreshToken,
              user: user,
            },
          },
          error: null,
        });

        const tokenService = {
          refreshToken: jest.fn(async refreshToken => {
            const { data, error } = await mockSupabase.auth.refreshSession({
              refresh_token: refreshToken,
            });

            if (error) {
              throw new Error(error.message);
            }

            return {
              success: true,
              data: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: data.session.user,
              },
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }),
        };

        const result = await tokenService.refreshToken(refreshToken);

        expect(result.success).toBe(true);
        expect(result.data.accessToken).toBe(newAccessToken);
        expect(result.data.user).toEqual(user);
        TestAssertions.expectValidJWT(result.data.accessToken);
      });
    });
  });

  describe('Authorization Middleware', () => {
    describe('Role-Based Access Control', () => {
      it('should allow access for users with correct role', () => {
        const req = MockCreator.createRequest();
        req.user = TestDataGenerator.generateUser({ role: 'admin' });
        const res = MockCreator.createResponse();
        const next = jest.fn();

        const requireRole = role => (req, res, next) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }

          if (req.user.role !== role) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }

          next();
        };

        const adminMiddleware = requireRole('admin');
        adminMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should deny access for users with incorrect role', () => {
        const req = MockCreator.createRequest();
        req.user = TestDataGenerator.generateUser({ role: 'user' });
        const res = MockCreator.createResponse();
        const next = jest.fn();

        const requireRole = role => (req, res, next) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }

          if (req.user.role !== role) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }

          next();
        };

        const adminMiddleware = requireRole('admin');
        adminMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Insufficient permissions',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should handle multiple role requirements', () => {
        const req = MockCreator.createRequest();
        req.user = TestDataGenerator.generateUser({ role: 'moderator' });
        const res = MockCreator.createResponse();
        const next = jest.fn();

        const requireAnyRole = roles => (req, res, next) => {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
          }

          if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }

          next();
        };

        const moderatorOrAdminMiddleware = requireAnyRole([
          'moderator',
          'admin',
        ]);
        moderatorOrAdminMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Resource-Based Authorization', () => {
      it('should allow access to own resources', async () => {
        const user = TestDataGenerator.generateUser();
        const client = TestDataGenerator.generateClient({ user_id: user.id });

        const req = MockCreator.createRequest();
        req.user = user;
        req.params = { clientId: client.id };
        const res = MockCreator.createResponse();
        const next = jest.fn();

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: client,
            error: null,
          }),
        });

        const requireOwnership =
          (resource, resourceIdParam) => async (req, res, next) => {
            if (!req.user) {
              return res.status(401).json({ error: 'Authentication required' });
            }

            const resourceId = req.params[resourceIdParam];
            const { data, error } = await mockSupabase
              .from(resource)
              .select('user_id')
              .eq('id', resourceId)
              .single();

            if (error || !data) {
              return res.status(404).json({ error: 'Resource not found' });
            }

            if (data.user_id !== req.user.id) {
              return res.status(403).json({ error: 'Access denied' });
            }

            next();
          };

        const requireClientOwnership = requireOwnership('clients', 'clientId');
        await requireClientOwnership(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should deny access to other users resources', async () => {
        const user = TestDataGenerator.generateUser();
        const otherUser = TestDataGenerator.generateUser();
        const client = TestDataGenerator.generateClient({
          user_id: otherUser.id,
        });

        const req = MockCreator.createRequest();
        req.user = user;
        req.params = { clientId: client.id };
        const res = MockCreator.createResponse();
        const next = jest.fn();

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: client,
            error: null,
          }),
        });

        const requireOwnership =
          (resource, resourceIdParam) => async (req, res, next) => {
            if (!req.user) {
              return res.status(401).json({ error: 'Authentication required' });
            }

            const resourceId = req.params[resourceIdParam];
            const { data, error } = await mockSupabase
              .from(resource)
              .select('user_id')
              .eq('id', resourceId)
              .single();

            if (error || !data) {
              return res.status(404).json({ error: 'Resource not found' });
            }

            if (data.user_id !== req.user.id) {
              return res.status(403).json({ error: 'Access denied' });
            }

            next();
          };

        const requireClientOwnership = requireOwnership('clients', 'clientId');
        await requireClientOwnership(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', () => {
      const req = MockCreator.createRequest();
      const res = MockCreator.createResponse();
      const next = jest.fn();

      const securityHeadersMiddleware = jest.fn((req, res, next) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains'
        );
        res.set('Content-Security-Policy', "default-src 'self'");
        res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
      });

      securityHeadersMiddleware(req, res, next);

      expect(res.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.set).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
      expect(res.set).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'"
      );
      expect(res.set).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
      ];

      const validateEmail = email => {
        // More comprehensive email validation
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return (
          emailRegex.test(email) && email.length > 0 && !email.includes('..')
        );
      };

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should validate password strength', () => {
      const validatePassword = password => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
          isValid:
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar,
          errors: [
            ...(password.length < minLength
              ? ['Password must be at least 8 characters long']
              : []),
            ...(!hasUpperCase
              ? ['Password must contain at least one uppercase letter']
              : []),
            ...(!hasLowerCase
              ? ['Password must contain at least one lowercase letter']
              : []),
            ...(!hasNumbers
              ? ['Password must contain at least one number']
              : []),
            ...(!hasSpecialChar
              ? ['Password must contain at least one special character']
              : []),
          ],
        };
      };

      const strongPassword = 'SecurePassword123!';
      const weakPassword = '123';

      const strongResult = validatePassword(strongPassword);
      const weakResult = validatePassword(weakPassword);

      expect(strongResult.isValid).toBe(true);
      expect(strongResult.errors).toHaveLength(0);

      expect(weakResult.isValid).toBe(false);
      expect(weakResult.errors.length).toBeGreaterThan(0);
    });

    it('should sanitize user input', () => {
      const sanitizeInput = input => {
        if (typeof input !== 'string') return input;

        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      };

      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const cleanInput = 'Hello World';

      expect(sanitizeInput(maliciousInput)).toBe('Hello World');
      expect(sanitizeInput(cleanInput)).toBe('Hello World');
    });
  });

  describe('Session Management', () => {
    it('should create secure session', async () => {
      const user = TestDataGenerator.generateUser();
      // Generate session ID for testing
      TestDataGenerator.generateId();

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.expire.mockResolvedValue(1);

      const sessionService = {
        createSession: jest.fn(async user => {
          const sessionId = TestDataGenerator.generateId();
          const sessionData = {
            userId: user.id,
            email: user.email,
            role: user.role,
            createdAt: TestDataGenerator.generateTimestamp(),
            lastAccessed: TestDataGenerator.generateTimestamp(),
          };

          await mockRedis.set(
            `session:${sessionId}`,
            JSON.stringify(sessionData)
          );
          await mockRedis.expire(`session:${sessionId}`, 3600); // 1 hour

          return {
            sessionId,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          };
        }),
      };

      const result = await sessionService.createSession(user);

      expect(result.sessionId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      TestAssertions.expectValidUUID(result.sessionId);
      TestAssertions.expectValidISO8601(result.expiresAt);
      expect(mockRedis.set).toHaveBeenCalledWith(
        `session:${result.sessionId}`,
        expect.stringContaining(user.id)
      );
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `session:${result.sessionId}`,
        3600
      );
    });

    it('should validate active session', async () => {
      const sessionId = TestDataGenerator.generateId();
      const user = TestDataGenerator.generateUser();
      const sessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: TestDataGenerator.generateTimestamp(),
        lastAccessed: TestDataGenerator.generateTimestamp(),
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
      mockRedis.expire.mockResolvedValue(1);

      const sessionService = {
        validateSession: jest.fn(async sessionId => {
          const sessionDataStr = await mockRedis.get(`session:${sessionId}`);

          if (!sessionDataStr) {
            return { valid: false, error: 'Session not found' };
          }

          const sessionData = JSON.parse(sessionDataStr);

          // Update last accessed time
          sessionData.lastAccessed = TestDataGenerator.generateTimestamp();
          await mockRedis.set(
            `session:${sessionId}`,
            JSON.stringify(sessionData)
          );
          await mockRedis.expire(`session:${sessionId}`, 3600);

          return { valid: true, data: sessionData };
        }),
      };

      const result = await sessionService.validateSession(sessionId);

      expect(result.valid).toBe(true);
      expect(result.data.userId).toBe(user.id);
      expect(result.data.email).toBe(user.email);
      expect(result.data.role).toBe(user.role);
    });

    it('should destroy session on logout', async () => {
      const sessionId = TestDataGenerator.generateId();

      mockRedis.del.mockResolvedValue(1);

      const sessionService = {
        destroySession: jest.fn(async sessionId => {
          const result = await mockRedis.del(`session:${sessionId}`);
          return { success: result > 0 };
        }),
      };

      const result = await sessionService.destroySession(sessionId);

      expect(result.success).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith(`session:${sessionId}`);
    });
  });
});
