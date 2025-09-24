/**
 * A/B Testing Unit Tests
 *
 * Comprehensive unit tests for the A/B testing framework.
 * Tests experiment management, user assignment, and analytics.
 */

import { ExperimentService } from '../../shared/ab-testing/ExperimentService';
import { ABTestingAPI } from '../../shared/ab-testing/api';
import {
  ExperimentAssignmentRequest,
  ExperimentCreateRequest,
  ExperimentEventRequest,
  ExperimentUpdateRequest,
} from '../../shared/ab-testing/types';

describe('A/B Testing Framework', () => {
  let experimentService: ExperimentService;
  let api: ABTestingAPI;

  beforeEach(() => {
    experimentService = new ExperimentService();
    api = new ABTestingAPI();
    // Use the same service instance for both
    (api as any).experimentService = experimentService;
  });

  describe('ExperimentService', () => {
    describe('createExperiment', () => {
      it('should create a new experiment successfully', async () => {
        const request: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
            {
              name: 'Treatment',
              description: 'Treatment variant',
              weight: 50,
              isControl: false,
              configuration: { feature: 'enabled' },
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [
            {
              name: 'Conversion Rate',
              type: {
                type: 'conversion',
                eventName: 'purchase',
              },
              description: 'Purchase conversion rate',
              primary: true,
              unit: '%',
            },
          ],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        const experiment = await experimentService.createExperiment(request);

        expect(experiment).toBeDefined();
        expect(experiment.id).toBeDefined();
        expect(experiment.name).toBe('Test Experiment');
        expect(experiment.status).toBe('draft');
        expect(experiment.variants).toHaveLength(2);
        expect(experiment.metrics).toHaveLength(1);
        expect(experiment.createdAt).toBeDefined();
        expect(experiment.updatedAt).toBeDefined();
      });

      it('should throw error for invalid experiment data', async () => {
        const request = {} as ExperimentCreateRequest;

        await expect(
          experimentService.createExperiment(request)
        ).rejects.toThrow();
      });
    });

    describe('updateExperiment', () => {
      it('should update an existing experiment', async () => {
        // First create an experiment
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);

        // Update the experiment
        const updateRequest: ExperimentUpdateRequest = {
          name: 'Updated Test Experiment',
          description: 'An updated test experiment',
        };

        // Add a small delay to ensure timestamps are different
        await new Promise(resolve => setTimeout(resolve, 1));

        const updatedExperiment = await experimentService.updateExperiment(
          experiment.id,
          updateRequest
        );

        expect(updatedExperiment.name).toBe('Updated Test Experiment');
        expect(updatedExperiment.description).toBe(
          'An updated test experiment'
        );
        expect(updatedExperiment.updatedAt.getTime()).toBeGreaterThan(
          experiment.updatedAt.getTime()
        );
      });

      it('should throw error for non-existent experiment', async () => {
        const updateRequest: ExperimentUpdateRequest = {
          name: 'Updated Test Experiment',
        };

        await expect(
          experimentService.updateExperiment('non-existent-id', updateRequest)
        ).rejects.toThrow('Experiment non-existent-id not found');
      });
    });

    describe('startExperiment', () => {
      it('should start a draft experiment', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        const startedExperiment = await experimentService.startExperiment(
          experiment.id
        );

        expect(startedExperiment.status).toBe('running');
        expect(startedExperiment.startDate).toBeDefined();
      });

      it('should throw error when starting non-draft experiment', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        // Try to start again
        await expect(
          experimentService.startExperiment(experiment.id)
        ).rejects.toThrow('Experiment');
      });
    });

    describe('assignUser', () => {
      it('should assign user to experiment variant', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
            {
              name: 'Treatment',
              description: 'Treatment variant',
              weight: 50,
              isControl: false,
              configuration: { feature: 'enabled' },
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const assignmentRequest: ExperimentAssignmentRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          sessionId: 'session-123',
        };

        const assignment =
          await experimentService.assignUser(assignmentRequest);

        expect(assignment.userId).toBe('user-123');
        expect(assignment.experimentId).toBe(experiment.id);
        expect(assignment.variantId).toBeDefined();
        expect(assignment.assignedAt).toBeDefined();
        expect(assignment.sessionId).toBe('session-123');
      });

      it('should return same assignment for repeated requests', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const assignmentRequest: ExperimentAssignmentRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          sessionId: 'session-123',
        };

        const assignment1 =
          await experimentService.assignUser(assignmentRequest);
        const assignment2 =
          await experimentService.assignUser(assignmentRequest);

        expect(assignment1.variantId).toBe(assignment2.variantId);
        expect(assignment1.assignedAt).toEqual(assignment2.assignedAt);
      });

      it('should throw error for non-running experiment', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);

        const assignmentRequest: ExperimentAssignmentRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          sessionId: 'session-123',
        };

        await expect(
          experimentService.assignUser(assignmentRequest)
        ).rejects.toThrow('Experiment');
      });
    });

    describe('recordEvent', () => {
      it('should record experiment event successfully', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const assignmentRequest: ExperimentAssignmentRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          sessionId: 'session-123',
        };

        const assignment =
          await experimentService.assignUser(assignmentRequest);

        const eventRequest: ExperimentEventRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          variantId: assignment.variantId,
          sessionId: 'session-123',
          event: {
            type: 'conversion',
            eventName: 'purchase',
            timestamp: new Date(),
            value: 100,
          },
        };

        await expect(
          experimentService.recordEvent(eventRequest)
        ).resolves.not.toThrow();
      });

      it('should throw error for unassigned user', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const eventRequest: ExperimentEventRequest = {
          userId: 'user-123',
          experimentId: experiment.id,
          variantId: 'variant-123',
          sessionId: 'session-123',
          event: {
            type: 'conversion',
            eventName: 'purchase',
            timestamp: new Date(),
            value: 100,
          },
        };

        await expect(
          experimentService.recordEvent(eventRequest)
        ).rejects.toThrow('User user-123 is not assigned to experiment');
      });
    });

    describe('getAnalytics', () => {
      it('should return experiment analytics', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const analyticsRequest = {
          experimentId: experiment.id,
        };

        const analytics =
          await experimentService.getAnalytics(analyticsRequest);

        expect(analytics).toBeDefined();
        expect(analytics.experimentId).toBe(experiment.id);
        expect(analytics.analytics).toBeDefined();
        expect(analytics.summary).toBeDefined();
        expect(analytics.generatedAt).toBeDefined();
      });
    });

    describe('generateReport', () => {
      it('should generate experiment report', async () => {
        const createRequest: ExperimentCreateRequest = {
          name: 'Test Experiment',
          description: 'A test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        const experiment =
          await experimentService.createExperiment(createRequest);
        await experimentService.startExperiment(experiment.id);

        const report = await experimentService.generateReport(experiment.id);

        expect(report).toBeDefined();
        expect(report.experimentId).toBe(experiment.id);
        expect(report.name).toBe('Test Experiment');
        expect(report.status).toBe('running');
        expect(report.variants).toBeDefined();
        expect(report.summary).toBeDefined();
        expect(report.recommendations).toBeDefined();
        expect(report.generatedAt).toBeDefined();
      });
    });
  });

  describe('ABTestingAPI', () => {
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
      mockRequest = {
        body: {},
        params: {},
        query: {},
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    describe('createExperiment', () => {
      it('should create experiment via API', async () => {
        mockRequest.body = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        await api.createExperiment(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              name: 'API Test Experiment',
            }),
            message: 'Experiment created successfully',
          })
        );
      });

      it('should handle API errors', async () => {
        mockRequest.body = {};

        await api.createExperiment(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.any(String),
          })
        );
      });
    });

    describe('getExperiment', () => {
      it('should get experiment via API', async () => {
        // First create an experiment
        const createRequest = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        mockRequest.body = createRequest;
        await api.createExperiment(mockRequest, mockResponse);

        const createdExperiment = mockResponse.json.mock.calls[0][0].data;
        mockRequest.params.experimentId = createdExperiment.id;

        await api.getExperiment(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              id: createdExperiment.id,
              name: 'API Test Experiment',
            }),
          })
        );
      });

      it('should handle non-existent experiment', async () => {
        mockRequest.params.experimentId = 'non-existent-id';

        await api.getExperiment(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Experiment not found',
          })
        );
      });
    });

    describe('assignUser', () => {
      it('should assign user via API', async () => {
        // First create and start an experiment
        const createRequest = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        mockRequest.body = createRequest;
        await api.createExperiment(mockRequest, mockResponse);

        const createdExperiment = mockResponse.json.mock.calls[0][0].data;
        mockRequest.params.experimentId = createdExperiment.id;
        await api.startExperiment(mockRequest, mockResponse);

        // Now assign user
        mockRequest.body = {
          userId: 'user-123',
          experimentId: createdExperiment.id,
          sessionId: 'session-123',
        };

        await api.assignUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              userId: 'user-123',
              experimentId: createdExperiment.id,
              variantId: expect.any(String),
            }),
            message: 'User assigned to experiment successfully',
          })
        );
      });
    });

    describe('recordEvent', () => {
      it('should record event via API', async () => {
        // First create, start experiment and assign user
        const createRequest = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        mockRequest.body = createRequest;
        await api.createExperiment(mockRequest, mockResponse);

        const createdExperiment = mockResponse.json.mock.calls[0][0].data;
        mockRequest.params.experimentId = createdExperiment.id;
        await api.startExperiment(mockRequest, mockResponse);

        mockRequest.body = {
          userId: 'user-123',
          experimentId: createdExperiment.id,
          sessionId: 'session-123',
        };
        await api.assignUser(mockRequest, mockResponse);

        const assignment =
          mockResponse.json.mock.calls[
            mockResponse.json.mock.calls.length - 1
          ][0].data;
        // Now record event
        mockRequest.body = {
          userId: 'user-123',
          experimentId: createdExperiment.id,
          variantId: assignment.variantId,
          sessionId: 'session-123',
          event: {
            type: 'conversion',
            eventName: 'purchase',
            timestamp: new Date(),
            value: 100,
          },
        };

        // Clear previous calls
        mockResponse.status.mockClear();
        mockResponse.json.mockClear();

        await api.recordEvent(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Event recorded successfully',
          })
        );
      });
    });

    describe('getAnalytics', () => {
      it('should get analytics via API', async () => {
        // First create and start an experiment
        const createRequest = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        mockRequest.body = createRequest;
        await api.createExperiment(mockRequest, mockResponse);

        const createdExperiment = mockResponse.json.mock.calls[0][0].data;
        mockRequest.params.experimentId = createdExperiment.id;

        await api.getAnalytics(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              experimentId: createdExperiment.id,
              analytics: expect.any(Array),
              summary: expect.any(Object),
            }),
          })
        );
      });
    });

    describe('generateReport', () => {
      it('should generate report via API', async () => {
        // First create and start an experiment
        const createRequest = {
          name: 'API Test Experiment',
          description: 'An API test experiment',
          variants: [
            {
              name: 'Control',
              description: 'Control variant',
              weight: 50,
              isControl: true,
              configuration: {},
            },
          ],
          targetAudience: {
            userSegments: [],
            conditions: [],
            percentage: 100,
          },
          metrics: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        mockRequest.body = createRequest;
        await api.createExperiment(mockRequest, mockResponse);

        const createdExperiment = mockResponse.json.mock.calls[0][0].data;
        mockRequest.params.experimentId = createdExperiment.id;

        await api.generateReport(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              experimentId: createdExperiment.id,
              name: 'API Test Experiment',
              variants: expect.any(Array),
              summary: expect.any(Object),
              recommendations: expect.any(Array),
            }),
          })
        );
      });
    });

    describe('getTemplates', () => {
      it('should get experiment templates', async () => {
        await api.getTemplates(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
          })
        );
      });
    });

    describe('getHealth', () => {
      it('should return health status', async () => {
        await api.getHealth(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              status: 'healthy',
              timestamp: expect.any(String),
              version: '1.0.0',
            }),
          })
        );
      });
    });
  });
});
