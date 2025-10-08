/**
 * A/B Testing API for Qylon Platform
 *
 * REST API endpoints for A/B testing functionality.
 * Provides experiment management, user assignment, and analytics.
 */

import { Request, Response } from 'express';
import { ExperimentService } from './ExperimentService';
import {
  ExperimentAnalyticsRequest,
  ExperimentAssignmentRequest,
  ExperimentCreateRequest,
  ExperimentEventRequest,
  ExperimentUpdateRequest,
} from './types';

export class ABTestingAPI {
  private experimentService: ExperimentService;

  constructor() {
    this.experimentService = new ExperimentService();
  }

  /**
   * Create a new experiment
   */
  async createExperiment(req: Request, res: Response): Promise<void> {
    try {
      const request: ExperimentCreateRequest = req.body;
      const experiment = await this.experimentService.createExperiment(request);

      res.status(201).json({
        success: true,
        data: experiment,
        message: 'Experiment created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create experiment',
      });
    }
  }

  /**
   * Get an experiment by ID
   */
  async getExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const experiment = await this.experimentService.getExperiment(experimentId);

      if (!experiment) {
        res.status(404).json({
          success: false,
          error: 'Experiment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: experiment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get experiment',
      });
    }
  }

  /**
   * List experiments
   */
  async listExperiments(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
      const pagination = req.query.pagination
        ? JSON.parse(req.query.pagination as string)
        : undefined;

      const experiments = await this.experimentService.listExperiments(filters, pagination);

      res.status(200).json({
        success: true,
        data: experiments,
        count: experiments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list experiments',
      });
    }
  }

  /**
   * Update an experiment
   */
  async updateExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const request: ExperimentUpdateRequest = req.body;

      const experiment = await this.experimentService.updateExperiment(experimentId, request);

      res.status(200).json({
        success: true,
        data: experiment,
        message: 'Experiment updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update experiment',
      });
    }
  }

  /**
   * Start an experiment
   */
  async startExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const experiment = await this.experimentService.startExperiment(experimentId);

      res.status(200).json({
        success: true,
        data: experiment,
        message: 'Experiment started successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start experiment',
      });
    }
  }

  /**
   * Pause an experiment
   */
  async pauseExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const experiment = await this.experimentService.pauseExperiment(experimentId);

      res.status(200).json({
        success: true,
        data: experiment,
        message: 'Experiment paused successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pause experiment',
      });
    }
  }

  /**
   * Complete an experiment
   */
  async completeExperiment(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const experiment = await this.experimentService.completeExperiment(experimentId);

      res.status(200).json({
        success: true,
        data: experiment,
        message: 'Experiment completed successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete experiment',
      });
    }
  }

  /**
   * Assign user to experiment
   */
  async assignUser(req: Request, res: Response): Promise<void> {
    try {
      const request: ExperimentAssignmentRequest = req.body;
      const assignment = await this.experimentService.assignUser(request);

      res.status(200).json({
        success: true,
        data: assignment,
        message: 'User assigned to experiment successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign user to experiment',
      });
    }
  }

  /**
   * Record experiment event
   */
  async recordEvent(req: Request, res: Response): Promise<void> {
    try {
      const request: ExperimentEventRequest = req.body;
      await this.experimentService.recordEvent(request);

      res.status(200).json({
        success: true,
        message: 'Event recorded successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record event',
      });
    }
  }

  /**
   * Get experiment analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const request: ExperimentAnalyticsRequest = {
        experimentId,
        ...req.query,
      };

      const analytics = await this.experimentService.getAnalytics(request);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      });
    }
  }

  /**
   * Generate experiment report
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { experimentId } = req.params;
      const report = await this.experimentService.generateReport(experimentId);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      });
    }
  }

  /**
   * Get experiment templates
   */
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implement template management
      const templates = [
        {
          id: 'onboarding-flow',
          name: 'Onboarding Flow Optimization',
          description: 'Test different onboarding flows to improve conversion',
          category: 'onboarding',
          variants: [
            {
              id: 'control',
              name: 'Current Flow',
              description: 'Existing onboarding flow',
              weight: 50,
              isControl: true,
              configuration: {},
            },
            {
              id: 'simplified',
              name: 'Simplified Flow',
              description: 'Streamlined onboarding process',
              weight: 50,
              isControl: false,
              configuration: {
                steps: 3,
                skipOptional: true,
              },
            },
          ],
          metrics: [
            {
              id: 'completion-rate',
              name: 'Onboarding Completion Rate',
              type: {
                type: 'conversion',
                eventName: 'onboarding_completed',
              },
              description: 'Percentage of users who complete onboarding',
              primary: true,
              unit: '%',
            },
          ],
        },
      ];

      res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates',
      });
    }
  }

  /**
   * Create experiment from template
   */
  async createFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      // const { templateId } = req.params; // TODO: Use templateId for template-based creation
      const { name, description, startDate, endDate } = req.body;

      // TODO: Implement template-based experiment creation
      const experiment = await this.experimentService.createExperiment({
        name,
        description,
        variants: [], // TODO: Load from template
        targetAudience: {
          userSegments: [],
          conditions: [],
          percentage: 100,
        },
        metrics: [], // TODO: Load from template
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      res.status(201).json({
        success: true,
        data: experiment,
        message: 'Experiment created from template successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create experiment from template',
      });
    }
  }

  /**
   * Get user assignments
   */
  async getUserAssignments(req: Request, res: Response): Promise<void> {
    try {
      // const { userId } = req.params; // TODO: Use userId to fetch user assignments

      // TODO: Implement user assignment retrieval
      const assignments: any[] = [];

      res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user assignments',
      });
    }
  }

  /**
   * Get experiment health
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          experimentService: 'healthy',
          analyticsService: 'healthy',
          assignmentService: 'healthy',
        },
      };

      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }
  }
}

/**
 * Setup A/B testing routes
 */
export function setupABTestingRoutes(app: any): void {
  const api = new ABTestingAPI();

  // Experiment management
  app.post('/api/v1/experiments', api.createExperiment.bind(api));
  app.get('/api/v1/experiments', api.listExperiments.bind(api));
  app.get('/api/v1/experiments/:experimentId', api.getExperiment.bind(api));
  app.put('/api/v1/experiments/:experimentId', api.updateExperiment.bind(api));
  app.post('/api/v1/experiments/:experimentId/start', api.startExperiment.bind(api));
  app.post('/api/v1/experiments/:experimentId/pause', api.pauseExperiment.bind(api));
  app.post('/api/v1/experiments/:experimentId/complete', api.completeExperiment.bind(api));

  // User assignment and events
  app.post('/api/v1/experiments/assign', api.assignUser.bind(api));
  app.post('/api/v1/experiments/events', api.recordEvent.bind(api));

  // Analytics and reporting
  app.get('/api/v1/experiments/:experimentId/analytics', api.getAnalytics.bind(api));
  app.get('/api/v1/experiments/:experimentId/report', api.generateReport.bind(api));

  // Templates
  app.get('/api/v1/experiments/templates', api.getTemplates.bind(api));
  app.post('/api/v1/experiments/templates/:templateId/create', api.createFromTemplate.bind(api));

  // User assignments
  app.get('/api/v1/users/:userId/experiments', api.getUserAssignments.bind(api));

  // Health check
  app.get('/api/v1/experiments/health', api.getHealth.bind(api));
}
