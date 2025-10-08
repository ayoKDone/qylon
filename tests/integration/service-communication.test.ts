/**
 * Service Communication Integration Tests
 *
 * Tests communication between microservices in the Qylon platform.
 * Validates service-to-service communication, error handling, and data flow.
 */

import axios from 'axios';
import { TestDataGenerator, TestUtils } from '../utils/test-helpers';

// Mock axios for service communication
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Service Communication Integration Tests', () => {
  let mockLogger: any;
  let serviceUrls: Record<string, string>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = TestUtils.createMockLogger();

    // Define service URLs
    serviceUrls = {
      apiGateway: 'http://localhost:3000',
      userManagement: 'http://localhost:3001',
      clientManagement: 'http://localhost:3002',
      meetingIntelligence: 'http://localhost:3003',
      contentCreation: 'http://localhost:3004',
      workflowAutomation: 'http://localhost:3005',
      integrationManagement: 'http://localhost:3006',
      notificationService: 'http://localhost:3007',
      analyticsReporting: 'http://localhost:3008',
    };
  });

  describe('API Gateway to Microservices Communication', () => {
    it('should route user requests to user management service', async () => {
      const user = TestDataGenerator.generateUser();
      const token = TestDataGenerator.generateJWT({ sub: user.id });

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: user,
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const apiGateway = {
        routeRequest: jest.fn(async (path, method, headers, _body) => {
          if (path.startsWith('/api/v1/users')) {
            const response = await mockedAxios.get(`${serviceUrls.userManagement}${path}`, {
              headers: { ...headers, 'x-service-call': 'api-gateway' },
            });
            return response.data;
          }
          throw new Error('Route not found');
        }),
      };

      const result = await apiGateway.routeRequest('/api/v1/users/profile', 'GET', {
        authorization: `Bearer ${token}`,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${serviceUrls.userManagement}/api/v1/users/profile`,
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: `Bearer ${token}`,
            'x-service-call': 'api-gateway',
          }),
        })
      );
    });

    it('should route client requests to client management service', async () => {
      const client = TestDataGenerator.generateClient();
      const token = TestDataGenerator.generateJWT({ sub: client.user_id });

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: [client],
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const apiGateway = {
        routeRequest: jest.fn(async (path, method, headers, _body) => {
          if (path.startsWith('/api/v1/clients')) {
            const response = await mockedAxios.get(`${serviceUrls.clientManagement}${path}`, {
              headers: { ...headers, 'x-service-call': 'api-gateway' },
            });
            return response.data;
          }
          throw new Error('Route not found');
        }),
      };

      const result = await apiGateway.routeRequest('/api/v1/clients', 'GET', {
        authorization: `Bearer ${token}`,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(client);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${serviceUrls.clientManagement}/api/v1/clients`,
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: `Bearer ${token}`,
            'x-service-call': 'api-gateway',
          }),
        })
      );
    });

    it('should route meeting requests to meeting intelligence service', async () => {
      const meeting = TestDataGenerator.generateMeeting();
      const token = TestDataGenerator.generateJWT({ sub: 'test-user-id' });

      mockedAxios.post.mockResolvedValue({
        status: 201,
        data: {
          success: true,
          data: meeting,
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const apiGateway = {
        routeRequest: jest.fn(async (path, method, headers, _body) => {
          if (path.startsWith('/api/v1/meetings')) {
            const response = await mockedAxios.post(
              `${serviceUrls.meetingIntelligence}${path}`,
              _body,
              {
                headers: { ...headers, 'x-service-call': 'api-gateway' },
              }
            );
            return response.data;
          }
          throw new Error('Route not found');
        }),
      };

      const meetingData = {
        title: meeting.title,
        client_id: meeting.client_id,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
      };

      const result = await apiGateway.routeRequest(
        '/api/v1/meetings',
        'POST',
        { authorization: `Bearer ${token}` },
        meetingData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(meeting);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${serviceUrls.meetingIntelligence}/api/v1/meetings`,
        meetingData,
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: `Bearer ${token}`,
            'x-service-call': 'api-gateway',
          }),
        })
      );
    });

    it('should handle service unavailable errors', async () => {
      const token = TestDataGenerator.generateJWT({ sub: 'test-user-id' });

      mockedAxios.get.mockRejectedValue({
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      });

      const apiGateway = {
        routeRequest: jest.fn(async (path, method, headers, _body) => {
          try {
            if (path.startsWith('/api/v1/meetings')) {
              const response = await mockedAxios.get(`${serviceUrls.meetingIntelligence}${path}`, {
                headers: { ...headers, 'x-service-call': 'api-gateway' },
              });
              return response.data;
            }
            throw new Error('Route not found');
          } catch (error) {
            if (error.code === 'ECONNREFUSED') {
              return {
                success: false,
                error: 'Service temporarily unavailable',
                service: 'meeting-intelligence',
                timestamp: TestDataGenerator.generateTimestamp(),
              };
            }
            throw error;
          }
        }),
      };

      const result = await apiGateway.routeRequest('/api/v1/meetings', 'GET', {
        authorization: `Bearer ${token}`,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service temporarily unavailable');
      expect(result.service).toBe('meeting-intelligence');
    });
  });

  describe('Microservice to Microservice Communication', () => {
    it('should allow meeting intelligence to fetch client data', async () => {
      const client = TestDataGenerator.generateClient();
      const meeting = TestDataGenerator.generateMeeting({
        client_id: client.id,
      });

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: client,
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const meetingIntelligenceService = {
        createMeeting: jest.fn(async meetingData => {
          // Fetch client data from client management service
          const clientResponse = await mockedAxios.get(
            `${serviceUrls.clientManagement}/api/v1/clients/${meetingData.client_id}`,
            {
              headers: { 'x-service-call': 'meeting-intelligence' },
            }
          );

          if (!clientResponse.data.success) {
            throw new Error('Client not found');
          }

          const client = clientResponse.data.data;

          // Create meeting with client data
          const meeting = {
            ...meetingData,
            id: TestDataGenerator.generateId(),
            created_at: TestDataGenerator.generateTimestamp(),
            updated_at: TestDataGenerator.generateTimestamp(),
          };

          return {
            success: true,
            data: meeting,
            client: client,
            timestamp: TestDataGenerator.generateTimestamp(),
          };
        }),
      };

      const meetingData = {
        title: meeting.title,
        client_id: client.id,
        start_time: meeting.start_time,
        end_time: meeting.end_time,
      };

      const result = await meetingIntelligenceService.createMeeting(meetingData);

      expect(result.success).toBe(true);
      expect(result.data.client_id).toBe(client.id);
      expect(result.client).toEqual(client);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${serviceUrls.clientManagement}/api/v1/clients/${client.id}`,
        expect.objectContaining({
          headers: { 'x-service-call': 'meeting-intelligence' },
        })
      );
    });

    it('should allow content creation to fetch meeting data', async () => {
      const meeting = TestDataGenerator.generateMeeting();
      // Generate content for testing
      TestDataGenerator.generateContent({
        meeting_id: meeting.id,
      });

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: meeting,
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const contentCreationService = {
        createMeetingSummary: jest.fn(async meetingId => {
          // Fetch meeting data from meeting intelligence service
          const meetingResponse = await mockedAxios.get(
            `${serviceUrls.meetingIntelligence}/api/v1/meetings/${meetingId}`,
            {
              headers: { 'x-service-call': 'content-creation' },
            }
          );

          if (!meetingResponse.data.success) {
            throw new Error('Meeting not found');
          }

          const meeting = meetingResponse.data.data;

          // Generate content based on meeting data
          const content = {
            id: TestDataGenerator.generateId(),
            title: `Summary: ${meeting.title}`,
            type: 'meeting_summary',
            content: `Meeting summary for ${meeting.title}`,
            meeting_id: meeting.id,
            client_id: meeting.client_id,
            created_at: TestDataGenerator.generateTimestamp(),
            updated_at: TestDataGenerator.generateTimestamp(),
          };

          return {
            success: true,
            data: content,
            meeting: meeting,
            timestamp: TestDataGenerator.generateTimestamp(),
          };
        }),
      };

      const result = await contentCreationService.createMeetingSummary(meeting.id);

      expect(result.success).toBe(true);
      expect(result.data.meeting_id).toBe(meeting.id);
      expect(result.meeting).toEqual(meeting);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${serviceUrls.meetingIntelligence}/api/v1/meetings/${meeting.id}`,
        expect.objectContaining({
          headers: { 'x-service-call': 'content-creation' },
        })
      );
    });

    it('should allow workflow automation to trigger notifications', async () => {
      const user = TestDataGenerator.generateUser();
      const notification = TestDataGenerator.generateNotification({
        user_id: user.id,
      });

      mockedAxios.post.mockResolvedValue({
        status: 201,
        data: {
          success: true,
          data: notification,
          timestamp: TestDataGenerator.generateTimestamp(),
        },
      });

      const workflowAutomationService = {
        triggerMeetingReminder: jest.fn(async (userId, meetingData) => {
          // Send notification via notification service
          const notificationResponse = await mockedAxios.post(
            `${serviceUrls.notificationService}/api/v1/notifications`,
            {
              user_id: userId,
              type: 'meeting_reminder',
              title: 'Meeting Reminder',
              message: `Your meeting "${meetingData.title}" is starting soon`,
            },
            {
              headers: { 'x-service-call': 'workflow-automation' },
            }
          );

          if (!notificationResponse.data.success) {
            throw new Error('Failed to send notification');
          }

          return {
            success: true,
            data: notificationResponse.data.data,
            timestamp: TestDataGenerator.generateTimestamp(),
          };
        }),
      };

      const meetingData = {
        title: 'Test Meeting',
        start_time: TestDataGenerator.generateTimestamp(),
      };

      const result = await workflowAutomationService.triggerMeetingReminder(user.id, meetingData);

      expect(result.success).toBe(true);
      expect(result.data.user_id).toBe(user.id);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${serviceUrls.notificationService}/api/v1/notifications`,
        expect.objectContaining({
          user_id: user.id,
          type: 'meeting_reminder',
          title: 'Meeting Reminder',
          message: `Your meeting "${meetingData.title}" is starting soon`,
        }),
        expect.objectContaining({
          headers: { 'x-service-call': 'workflow-automation' },
        })
      );
    });
  });

  describe('Database Integration', () => {
    it('should handle database connection failures gracefully', async () => {
      const mockDatabase = {
        query: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        isConnected: jest.fn().mockReturnValue(false),
      };

      const serviceWithDB = {
        getData: jest.fn(async () => {
          try {
            if (!mockDatabase.isConnected()) {
              throw new Error('Database not connected');
            }
            const result = await mockDatabase.query('SELECT * FROM test_table');
            return { success: true, data: result };
          } catch (error) {
            return {
              success: false,
              error: error.message,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }
        }),
      };

      const result = await serviceWithDB.getData();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database not connected');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle database transaction rollbacks', async () => {
      const mockDatabase = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        query: jest
          .fn()
          .mockResolvedValueOnce({ success: true }) // First query succeeds
          .mockRejectedValueOnce(new Error('Constraint violation')), // Second query fails
      };

      const serviceWithTransaction = {
        createUserWithClient: jest.fn(async (userData, clientData) => {
          await mockDatabase.beginTransaction();

          try {
            // Create user
            await mockDatabase.query('INSERT INTO users ...', userData);

            // Create client (this will fail)
            await mockDatabase.query('INSERT INTO clients ...', clientData);

            await mockDatabase.commit();
            return { success: true };
          } catch (error) {
            await mockDatabase.rollback();
            return {
              success: false,
              error: error.message,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }
        }),
      };

      const userData = TestDataGenerator.generateUser();
      const clientData = TestDataGenerator.generateClient();

      const result = await serviceWithTransaction.createUserWithClient(userData, clientData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Constraint violation');
      expect(mockDatabase.rollback).toHaveBeenCalled();
      expect(mockDatabase.commit).not.toHaveBeenCalled();
    });
  });

  describe('External API Integration', () => {
    it('should handle external API failures with fallback', async () => {
      const integrationService = {
        syncWithExternalAPI: jest.fn(async data => {
          try {
            // Try primary external API
            const response = await mockedAxios.post('https://api.external-service.com/sync', data, {
              timeout: 5000,
            });
            return {
              success: true,
              data: response.data,
              source: 'primary',
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          } catch {
            // Fallback to secondary API
            try {
              const fallbackResponse = await mockedAxios.post(
                'https://backup.external-service.com/sync',
                data,
                {
                  timeout: 5000,
                }
              );
              return {
                success: true,
                data: fallbackResponse.data,
                source: 'fallback',
                timestamp: TestDataGenerator.generateTimestamp(),
              };
            } catch {
              return {
                success: false,
                error: 'All external services unavailable',
                timestamp: TestDataGenerator.generateTimestamp(),
              };
            }
          }
        }),
      };

      // Mock primary API failure
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Primary API unavailable'))
        .mockResolvedValueOnce({
          status: 200,
          data: { synced: true, id: 'backup-123' },
        });

      const testData = { id: 'test-123', name: 'Test Data' };
      const result = await integrationService.syncWithExternalAPI(testData);

      expect(result.success).toBe(true);
      expect(result.source).toBe('fallback');
      expect(result.data.synced).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should handle external API rate limiting', async () => {
      const integrationService = {
        callExternalAPI: jest.fn(async data => {
          try {
            const response = await mockedAxios.post('https://api.rate-limited.com/data', data);
            return {
              success: true,
              data: response.data,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          } catch (error) {
            if (error.response?.status === 429) {
              // Rate limited - retry after delay
              const retryAfter = error.response.headers['retry-after'] || 60;
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

              // Retry once
              const retryResponse = await mockedAxios.post(
                'https://api.rate-limited.com/data',
                data
              );
              return {
                success: true,
                data: retryResponse.data,
                retried: true,
                timestamp: TestDataGenerator.generateTimestamp(),
              };
            }
            throw error;
          }
        }),
      };

      // Mock rate limit response
      mockedAxios.post
        .mockRejectedValueOnce({
          response: {
            status: 429,
            headers: { 'retry-after': '1' },
          },
        })
        .mockResolvedValueOnce({
          status: 200,
          data: { success: true },
        });

      const testData = { id: 'test-123' };
      const result = await integrationService.callExternalAPI(testData);

      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event-Driven Communication', () => {
    it('should publish and consume events between services', async () => {
      // Generate event for testing
      TestDataGenerator.generateEvent('meeting.created', {
        meetingId: 'test-meeting-id',
        clientId: 'test-client-id',
      });

      const eventBus = {
        publish: jest.fn(async event => {
          // Simulate event publishing
          return { success: true, eventId: event.id };
        }),
        subscribe: jest.fn((_eventType, _handler) => {
          // Simulate event subscription
          return { subscriptionId: 'sub-123' };
        }),
      };

      const meetingService = {
        createMeeting: jest.fn(async meetingData => {
          const meeting = {
            ...meetingData,
            id: TestDataGenerator.generateId(),
            created_at: TestDataGenerator.generateTimestamp(),
          };

          // Publish event
          await eventBus.publish({
            type: 'meeting.created',
            aggregateId: meeting.id,
            payload: meeting,
            metadata: {
              userId: 'test-user-id',
              timestamp: TestDataGenerator.generateTimestamp(),
            },
          });

          return {
            success: true,
            data: meeting,
            timestamp: TestDataGenerator.generateTimestamp(),
          };
        }),
      };

      // Content service would handle meeting created events
      // const contentService = {
      //   handleMeetingCreated: jest.fn(async event => {
      //     // Process the event
      //     const content = TestDataGenerator.generateContent({
      //       meeting_id: event.payload.id,
      //       client_id: event.payload.client_id,
      //     });

      //     return {
      //       success: true,
      //       data: content,
      //       timestamp: TestDataGenerator.generateTimestamp(),
      //     };
      //   }),
      // };

      const meetingData = TestDataGenerator.generateMeeting();
      const result = await meetingService.createMeeting(meetingData);

      expect(result.success).toBe(true);
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'meeting.created',
          aggregateId: result.data.id,
          payload: result.data,
        })
      );
    });

    it('should handle event processing failures', async () => {
      const event = TestDataGenerator.generateEvent('meeting.created', {
        meetingId: 'test-meeting-id',
      });

      const eventProcessor = {
        processEvent: jest.fn(async event => {
          try {
            // Simulate processing that might fail
            if (event.payload.meetingId === 'invalid-id') {
              throw new Error('Invalid meeting ID');
            }

            return {
              success: true,
              processed: true,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          } catch (error) {
            // Log error and mark event as failed
            mockLogger.error('Event processing failed', {
              eventId: event.id,
              eventType: event.type,
              error: error.message,
            });

            return {
              success: false,
              error: error.message,
              timestamp: TestDataGenerator.generateTimestamp(),
            };
          }
        }),
      };

      const invalidEvent = { ...event, payload: { meetingId: 'invalid-id' } };
      const result = await eventProcessor.processEvent(invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid meeting ID');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Event processing failed',
        expect.objectContaining({
          eventId: event.id,
          eventType: event.type,
          error: 'Invalid meeting ID',
        })
      );
    });
  });

  describe('Health Check Integration', () => {
    it('should check health of all services', async () => {
      const healthChecker = {
        checkAllServices: jest.fn(async () => {
          const services = Object.keys(serviceUrls);
          const healthResults = [];

          for (const service of services) {
            try {
              const response = await mockedAxios.get(`${serviceUrls[service]}/health`, {
                timeout: 5000,
              });
              healthResults.push({
                service,
                status: 'healthy',
                responseTime: response.headers['x-response-time'] || 'unknown',
                timestamp: TestDataGenerator.generateTimestamp(),
              });
            } catch (error) {
              healthResults.push({
                service,
                status: 'unhealthy',
                error: error.message,
                timestamp: TestDataGenerator.generateTimestamp(),
              });
            }
          }

          return {
            success: true,
            data: healthResults,
            timestamp: TestDataGenerator.generateTimestamp(),
          };
        }),
      };

      // Mock some services as healthy and some as unhealthy
      mockedAxios.get
        .mockResolvedValueOnce({
          status: 200,
          headers: { 'x-response-time': '50ms' },
        }) // api-gateway
        .mockResolvedValueOnce({
          status: 200,
          headers: { 'x-response-time': '30ms' },
        }) // user-management
        .mockRejectedValueOnce(new Error('Connection refused')) // client-management
        .mockResolvedValueOnce({
          status: 200,
          headers: { 'x-response-time': '40ms' },
        }) // meeting-intelligence
        .mockRejectedValueOnce(
          new Error("Cannot read properties of undefined (reading 'x-response-time')")
        ) // content-creation
        .mockRejectedValueOnce(
          new Error("Cannot read properties of undefined (reading 'x-response-time')")
        ) // workflow-automation
        .mockRejectedValueOnce(
          new Error("Cannot read properties of undefined (reading 'x-response-time')")
        ) // integration-management
        .mockRejectedValueOnce(
          new Error("Cannot read properties of undefined (reading 'x-response-time')")
        ) // notification-service
        .mockRejectedValueOnce(
          new Error("Cannot read properties of undefined (reading 'x-response-time')")
        ); // analytics-reporting

      const result = await healthChecker.checkAllServices();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(9);

      const healthyServices = result.data.filter(s => s.status === 'healthy');
      const unhealthyServices = result.data.filter(s => s.status === 'unhealthy');

      expect(healthyServices.length).toBeGreaterThan(0);
      expect(unhealthyServices.length).toBeGreaterThan(0);
    });
  });
});
