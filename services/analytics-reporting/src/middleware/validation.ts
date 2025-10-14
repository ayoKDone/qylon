/**
 * Validation Middleware for Analytics Service
 */

import { NextFunction, Request, Response } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

export class ValidationMiddleware {
  /**
   * Validate request body against schema
   */
  validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }

        res.status(500).json({
          error: 'VALIDATION_ERROR',
          message: 'Internal validation error'
        });
      }
    };
  };

  /**
   * Validate request query parameters against schema
   */
  validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.query = schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }

        res.status(500).json({
          error: 'VALIDATION_ERROR',
          message: 'Internal validation error'
        });
      }
    };
  };

  /**
   * Validate request parameters against schema
   */
  validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.params = schema.parse(req.params);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Invalid URL parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }

        res.status(500).json({
          error: 'VALIDATION_ERROR',
          message: 'Internal validation error'
        });
      }
    };
  };
}

// Common validation schemas
export const ValidationSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Pagination
  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0)
  }),

  // Date range
  dateRange: z.object({
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }).refine(data => {
    if (data.start_date && data.end_date) {
      return data.start_date <= data.end_date;
    }
    return true;
  }, {
    message: 'Start date must be before or equal to end date',
    path: ['start_date']
  }),

  // Event tracking
  trackEvent: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    client_id: z.string().uuid('Invalid client ID'),
    event_type: z.string().min(1, 'Event type is required'),
    event_name: z.string().min(1, 'Event name is required'),
    event_data: z.record(z.any()).optional(),
    session_id: z.string().optional(),
    page_url: z.string().url().optional(),
    referrer: z.string().optional(),
    user_agent: z.string().optional(),
    ip_address: z.string().ip().optional()
  }),

  // Conversion tracking
  trackConversion: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    client_id: z.string().uuid('Invalid client ID'),
    conversion_type: z.string().min(1, 'Conversion type is required'),
    conversion_value: z.number().positive().optional(),
    experiment_id: z.string().uuid().optional(),
    variant_id: z.string().uuid().optional(),
    funnel_step_id: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional()
  }),

  // Funnel step creation
  createFunnelStep: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    client_id: z.string().uuid('Invalid client ID'),
    funnel_name: z.string().min(1, 'Funnel name is required'),
    step_number: z.number().int().positive('Step number must be positive'),
    step_name: z.string().min(1, 'Step name is required'),
    step_description: z.string().optional(),
    time_spent_seconds: z.number().int().min(0).optional(),
    metadata: z.record(z.any()).optional()
  }),

  // Complete funnel step
  completeFunnelStep: z.object({
    funnel_step_id: z.string().uuid('Invalid funnel step ID'),
    time_spent_seconds: z.number().int().min(0).optional(),
    metadata: z.record(z.any()).optional()
  }),

  // Create experiment
  createExperiment: z.object({
    name: z.string().min(1, 'Experiment name is required'),
    description: z.string().optional(),
    experiment_type: z.enum(['onboarding', 'feature_adoption', 'retention', 'conversion']),
    target_audience: z.record(z.any()),
    success_metrics: z.record(z.any()),
    configuration: z.record(z.any()).optional(),
    variants: z.array(z.object({
      variant_name: z.string().min(1, 'Variant name is required'),
      variant_description: z.string().optional(),
      traffic_percentage: z.number().min(0).max(100, 'Traffic percentage must be between 0 and 100'),
      configuration: z.record(z.any()),
      is_control: z.boolean().optional()
    })).min(2, 'At least 2 variants are required')
  }),

  // Create personalization trigger
  createPersonalizationTrigger: z.object({
    name: z.string().min(1, 'Trigger name is required'),
    description: z.string().optional(),
    trigger_type: z.enum(['user_behavior', 'time_based', 'event_based', 'segment_based']),
    conditions: z.record(z.any()),
    actions: z.record(z.any()),
    priority: z.number().int().min(0).optional()
  }),

  // Create user segment
  createUserSegment: z.object({
    name: z.string().min(1, 'Segment name is required'),
    description: z.string().optional(),
    segment_criteria: z.record(z.any())
  }),

  // Analytics filter
  analyticsFilter: z.object({
    user_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    event_type: z.string().optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0)
  }),

  // Funnel analytics filter
  funnelAnalyticsFilter: z.object({
    funnel_name: z.string().optional(),
    user_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }),

  // Experiment filter
  experimentFilter: z.object({
    status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
    experiment_type: z.enum(['onboarding', 'feature_adoption', 'retention', 'conversion']).optional(),
    created_by: z.string().uuid().optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }),

  // URL parameters
  idParam: z.object({
    id: z.string().uuid('Invalid ID format')
  }),

  userIdParam: z.object({
    userId: z.string().uuid('Invalid user ID format')
  }),

  clientIdParam: z.object({
    clientId: z.string().uuid('Invalid client ID format')
  }),

  experimentIdParam: z.object({
    experimentId: z.string().uuid('Invalid experiment ID format')
  }),

  // Funnel conversion rate calculation
  funnelConversionRate: z.object({
    funnel_name: z.string().min(1, 'Funnel name is required'),
    start_step: z.number().int().positive('Start step must be positive'),
    end_step: z.number().int().positive('End step must be positive'),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }).refine(data => data.start_step <= data.end_step, {
    message: 'Start step must be less than or equal to end step',
    path: ['start_step']
  })
};

// Helper function to create validation middleware
export const createValidationMiddleware = () => new ValidationMiddleware();
