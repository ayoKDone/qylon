/**
 * Analytics API Routes
 * Feature 2.6: Analytics & A/B Testing Backend (21 SP)
 */

import { Request, Response, Router } from 'express';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { ValidationMiddleware, ValidationSchemas } from '../middleware/validation';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsServiceError } from '../types/analytics';

export class AnalyticsRoutes {
  private router: Router;
  private analyticsService: AnalyticsService;
  private authMiddleware: AuthMiddleware;
  private validationMiddleware: ValidationMiddleware;

  constructor(analyticsService: AnalyticsService, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.analyticsService = analyticsService;
    this.authMiddleware = authMiddleware;
    this.validationMiddleware = new ValidationMiddleware();

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Event tracking routes
    this.router.post(
      '/events',
      this.validationMiddleware.validateBody(ValidationSchemas.trackEvent),
      this.authMiddleware.optionalAuth,
      this.trackEvent.bind(this),
    );

    this.router.get(
      '/events',
      this.validationMiddleware.validateQuery(ValidationSchemas.analyticsFilter),
      this.authMiddleware.authenticate,
      this.getEvents.bind(this),
    );

    // Conversion tracking routes
    this.router.post(
      '/conversions',
      this.validationMiddleware.validateBody(ValidationSchemas.trackConversion),
      this.authMiddleware.optionalAuth,
      this.trackConversion.bind(this),
    );

    this.router.get(
      '/conversions',
      this.validationMiddleware.validateQuery(ValidationSchemas.analyticsFilter),
      this.authMiddleware.authenticate,
      this.getConversions.bind(this),
    );

    // User analytics routes
    this.router.get(
      '/users/:userId',
      this.validationMiddleware.validateParams(ValidationSchemas.userIdParam),
      this.authMiddleware.authenticate,
      this.authMiddleware.validateUserAccess,
      this.getUserAnalytics.bind(this),
    );

    // Client analytics routes
    this.router.get(
      '/clients/:clientId',
      this.validationMiddleware.validateParams(ValidationSchemas.clientIdParam),
      this.authMiddleware.authenticate,
      this.authMiddleware.validateClientAccess,
      this.getClientAnalytics.bind(this),
    );

    // Dashboard route
    this.router.get(
      '/dashboard',
      this.validationMiddleware.validateQuery(ValidationSchemas.analyticsFilter.partial()),
      this.authMiddleware.authenticate,
      this.getDashboard.bind(this),
    );

    // Funnel tracking routes
    this.router.post(
      '/funnels/steps',
      this.validationMiddleware.validateBody(ValidationSchemas.createFunnelStep),
      this.authMiddleware.authenticate,
      this.createFunnelStep.bind(this),
    );

    this.router.put(
      '/funnels/steps/:id',
      this.validationMiddleware.validateParams(ValidationSchemas.idParam),
      this.validationMiddleware.validateBody(ValidationSchemas.completeFunnelStep),
      this.authMiddleware.authenticate,
      this.completeFunnelStep.bind(this),
    );

    this.router.get(
      '/funnels/:funnelName/conversion-rate',
      this.validationMiddleware.validateQuery(ValidationSchemas.funnelConversionRate),
      this.authMiddleware.authenticate,
      this.getFunnelConversionRate.bind(this),
    );

    this.router.get(
      '/funnels/analytics',
      this.validationMiddleware.validateQuery(ValidationSchemas.funnelAnalyticsFilter),
      this.authMiddleware.authenticate,
      this.getFunnelAnalytics.bind(this),
    );

    // Experiment routes
    this.router.post(
      '/experiments',
      this.validationMiddleware.validateBody(ValidationSchemas.createExperiment),
      this.authMiddleware.authenticate,
      this.createExperiment.bind(this),
    );

    this.router.get(
      '/experiments',
      this.validationMiddleware.validateQuery(ValidationSchemas.experimentFilter),
      this.authMiddleware.authenticate,
      this.getExperiments.bind(this),
    );

    this.router.get(
      '/experiments/:experimentId',
      this.validationMiddleware.validateParams(ValidationSchemas.experimentIdParam),
      this.authMiddleware.authenticate,
      this.getExperiment.bind(this),
    );

    this.router.post(
      '/experiments/:experimentId/start',
      this.validationMiddleware.validateParams(ValidationSchemas.experimentIdParam),
      this.authMiddleware.authenticate,
      this.startExperiment.bind(this),
    );

    this.router.post(
      '/experiments/:experimentId/stop',
      this.validationMiddleware.validateParams(ValidationSchemas.experimentIdParam),
      this.authMiddleware.authenticate,
      this.stopExperiment.bind(this),
    );

    this.router.get(
      '/experiments/:experimentId/results',
      this.validationMiddleware.validateParams(ValidationSchemas.experimentIdParam),
      this.authMiddleware.authenticate,
      this.getExperimentResults.bind(this),
    );

    this.router.post(
      '/experiments/:experimentId/assign',
      this.validationMiddleware.validateParams(ValidationSchemas.experimentIdParam),
      this.authMiddleware.authenticate,
      this.assignUserToExperiment.bind(this),
    );

    // Personalization routes
    this.router.post(
      '/personalization/triggers',
      this.validationMiddleware.validateBody(ValidationSchemas.createPersonalizationTrigger),
      this.authMiddleware.authenticate,
      this.createPersonalizationTrigger.bind(this),
    );

    this.router.get(
      '/personalization/triggers',
      this.authMiddleware.authenticate,
      this.getPersonalizationTriggers.bind(this),
    );

    this.router.put(
      '/personalization/triggers/:id',
      this.validationMiddleware.validateParams(ValidationSchemas.idParam),
      this.validationMiddleware.validateBody(
        ValidationSchemas.createPersonalizationTrigger.partial(),
      ),
      this.authMiddleware.authenticate,
      this.updatePersonalizationTrigger.bind(this),
    );

    this.router.delete(
      '/personalization/triggers/:id',
      this.validationMiddleware.validateParams(ValidationSchemas.idParam),
      this.authMiddleware.authenticate,
      this.deletePersonalizationTrigger.bind(this),
    );

    // User segments routes
    this.router.post(
      '/segments',
      this.validationMiddleware.validateBody(ValidationSchemas.createUserSegment),
      this.authMiddleware.authenticate,
      this.createUserSegment.bind(this),
    );

    this.router.get('/segments', this.authMiddleware.authenticate, this.getUserSegments.bind(this));

    this.router.put(
      '/segments/:id',
      this.validationMiddleware.validateParams(ValidationSchemas.idParam),
      this.validationMiddleware.validateBody(ValidationSchemas.createUserSegment.partial()),
      this.authMiddleware.authenticate,
      this.updateUserSegment.bind(this),
    );

    this.router.delete(
      '/segments/:id',
      this.validationMiddleware.validateParams(ValidationSchemas.idParam),
      this.authMiddleware.authenticate,
      this.deleteUserSegment.bind(this),
    );

    this.router.get(
      '/users/:userId/segments',
      this.validationMiddleware.validateParams(ValidationSchemas.userIdParam),
      this.authMiddleware.authenticate,
      this.authMiddleware.validateUserAccess,
      this.getUserSegmentMemberships.bind(this),
    );

    this.router.post(
      '/users/:userId/segments/update',
      this.validationMiddleware.validateParams(ValidationSchemas.userIdParam),
      this.authMiddleware.authenticate,
      this.authMiddleware.validateUserAccess,
      this.updateUserSegmentMemberships.bind(this),
    );
  }

  // Event tracking handlers
  private async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = await this.analyticsService.trackEvent(req.body);
      res.status(201).json({
        success: true,
        data: event,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const events = await this.analyticsService.getAnalyticsEvents(req.query);
      res.json({
        success: true,
        data: events,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Conversion tracking handlers
  private async trackConversion(req: Request, res: Response): Promise<void> {
    try {
      const conversion = await this.analyticsService.trackConversion(req.body);
      res.status(201).json({
        success: true,
        data: conversion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getConversions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversions = await this.analyticsService.getConversionEvents(req.query);
      res.json({
        success: true,
        data: conversions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // User analytics handlers
  private async getUserAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getUserAnalytics(req.params.userId);
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Client analytics handlers
  private async getClientAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getClientAnalytics(req.params.clientId);
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Dashboard handler
  private async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dashboard = await this.analyticsService.getAnalyticsDashboard(
        req.query.client_id as string,
      );
      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Funnel tracking handlers
  private async createFunnelStep(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const funnelStep = await this.analyticsService.getFunnelTracking().createFunnelStep(req.body);
      res.status(201).json({
        success: true,
        data: funnelStep,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async completeFunnelStep(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const funnelStep = await this.analyticsService.getFunnelTracking().completeFunnelStep({
        funnel_step_id: req.params.id,
        ...req.body,
      });
      res.json({
        success: true,
        data: funnelStep,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getFunnelConversionRate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversionRate = await this.analyticsService
        .getFunnelTracking()
        .getFunnelConversionRates(
          req.query.funnel_name as string,
          parseInt(req.query.start_step as string) || 1,
          parseInt(req.query.end_step as string) || 10,
          req.query.start_date ? new Date(req.query.start_date as string) : undefined,
          req.query.end_date ? new Date(req.query.end_date as string) : undefined,
        );
      res.json({
        success: true,
        data: conversionRate,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getFunnelAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService
        .getFunnelTracking()
        .getFunnelAnalytics(req.query);
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Experiment handlers
  private async createExperiment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const experiment = await this.analyticsService
        .getConversionOptimization()
        .createExperiment(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: experiment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getExperiments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const experiments = await this.analyticsService
        .getConversionOptimization()
        .getExperiments(req.query);
      res.json({
        success: true,
        data: experiments,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getExperiment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const experiments = await this.analyticsService.getConversionOptimization().getExperiments({
        ...req.query,
        id: req.params.experimentId,
      });

      if (experiments.length === 0) {
        res.status(404).json({
          error: 'EXPERIMENT_NOT_FOUND',
          message: 'Experiment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: experiments[0],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async startExperiment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const experiment = await this.analyticsService
        .getConversionOptimization()
        .startExperiment(req.params.experimentId);
      res.json({
        success: true,
        data: experiment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async stopExperiment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const experiment = await this.analyticsService
        .getConversionOptimization()
        .stopExperiment(req.params.experimentId);
      res.json({
        success: true,
        data: experiment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getExperimentResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const results = await this.analyticsService
        .getConversionOptimization()
        .getExperimentResults(req.params.experimentId);
      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async assignUserToExperiment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assignment = await this.analyticsService
        .getConversionOptimization()
        .assignUserToExperiment(req.user!.id, req.params.experimentId);
      res.json({
        success: true,
        data: assignment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Personalization handlers
  private async createPersonalizationTrigger(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const trigger = await this.analyticsService
        .getPersonalization()
        .createPersonalizationTrigger(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: trigger,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getPersonalizationTriggers(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const triggers = await this.analyticsService
        .getPersonalization()
        .getPersonalizationTriggers(
          req.query.is_active ? req.query.is_active === 'true' : undefined,
          req.query.trigger_type as string,
        );
      res.json({
        success: true,
        data: triggers,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updatePersonalizationTrigger(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const trigger = await this.analyticsService
        .getPersonalization()
        .updatePersonalizationTrigger(req.params.id, req.body);
      res.json({
        success: true,
        data: trigger,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async deletePersonalizationTrigger(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      await this.analyticsService.getPersonalization().deletePersonalizationTrigger(req.params.id);
      res.json({
        success: true,
        message: 'Personalization trigger deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // User segment handlers
  private async createUserSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const segment = await this.analyticsService
        .getPersonalization()
        .createUserSegment(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: segment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getUserSegments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const segments = await this.analyticsService
        .getPersonalization()
        .getUserSegments(req.query.is_active ? req.query.is_active === 'true' : undefined);
      res.json({
        success: true,
        data: segments,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateUserSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const segment = await this.analyticsService
        .getPersonalization()
        .updateUserSegment(req.params.id, req.body);
      res.json({
        success: true,
        data: segment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async deleteUserSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await this.analyticsService.getPersonalization().deleteUserSegment(req.params.id);
      res.json({
        success: true,
        message: 'User segment deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getUserSegmentMemberships(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const memberships = await this.analyticsService
        .getPersonalization()
        .getUserSegmentMemberships(req.params.userId);
      res.json({
        success: true,
        data: memberships,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateUserSegmentMemberships(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const memberships = await this.analyticsService
        .getPersonalization()
        .updateUserSegmentMemberships(req.params.userId);
      res.json({
        success: true,
        data: memberships,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Error handling
  private handleError(error: any, res: Response): void {
    console.error('Analytics API Error:', error);

    if (error instanceof AnalyticsServiceError) {
      res.status(400).json({
        error: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
