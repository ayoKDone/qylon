import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { EventDrivenOrchestrator, OrchestrationResult } from './EventDrivenOrchestrator';
import { IntegrationServiceCoordinator } from './IntegrationServiceCoordinator';
import { WorkflowTriggerSystem } from './WorkflowTriggerSystem';
// Note: Event types would be imported from event-sourcing service
// For now, we'll define them locally
interface Event {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  eventVersion: number;
  timestamp: Date;
  userId: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

export interface OrchestrationServiceConfig {
  enableWorkflowTriggers: boolean;
  enableIntegrationCoordination: boolean;
  enableEventDrivenArchitecture: boolean;
  maxConcurrentEvents: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ServiceHealthStatus {
  overall: boolean;
  components: {
    workflowTriggers: boolean;
    integrationCoordination: boolean;
    eventDrivenOrchestration: boolean;
    database: boolean;
  };
  metrics: {
    totalEventsProcessed: number;
    eventsProcessedToday: number;
    averageProcessingTime: number;
    successRate: number;
    errorRate: number;
    activeWorkflows: number;
    activeIntegrations: number;
  };
}

export class WorkflowOrchestrationService {
  private supabase;
  private config: OrchestrationServiceConfig;
  private workflowTriggerSystem: WorkflowTriggerSystem;
  private integrationCoordinator: IntegrationServiceCoordinator;
  private eventDrivenOrchestrator: EventDrivenOrchestrator;
  private isRunning: boolean = false;
  private eventSubscription: any = null;

  constructor(config?: Partial<OrchestrationServiceConfig>) {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    this.config = {
      enableWorkflowTriggers: true,
      enableIntegrationCoordination: true,
      enableEventDrivenArchitecture: true,
      maxConcurrentEvents: 100,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.workflowTriggerSystem = new WorkflowTriggerSystem();
    this.integrationCoordinator = new IntegrationServiceCoordinator();
    this.eventDrivenOrchestrator = new EventDrivenOrchestrator();
  }

  /**
   * Start the orchestration service
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting Workflow Orchestration Service', {
        config: this.config,
      });

      // Initialize components
      await this.initializeComponents();

      // Start event subscription if event-driven architecture is enabled
      if (this.config.enableEventDrivenArchitecture) {
        await this.startEventSubscription();
      }

      this.isRunning = true;

      logger.info('Workflow Orchestration Service started successfully');
    } catch (error) {
      logger.error('Failed to start Workflow Orchestration Service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Stop the orchestration service
   */
  async stop(): Promise<void> {
    try {
      logger.info('Stopping Workflow Orchestration Service');

      this.isRunning = false;

      // Stop event subscription
      if (this.eventSubscription) {
        await this.eventSubscription.unsubscribe();
        this.eventSubscription = null;
      }

      // Shutdown orchestrator
      await this.eventDrivenOrchestrator.shutdown();

      logger.info('Workflow Orchestration Service stopped successfully');
    } catch (error) {
      logger.error('Failed to stop Workflow Orchestration Service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Initialize service components
   */
  private async initializeComponents(): Promise<void> {
    try {
      // Test database connection
      const { error: dbError } = await this.supabase.from('workflows').select('id').limit(1);
      if (dbError) {
        throw new Error(`Database connection failed: ${dbError.message}`);
      }

      // Test component health
      const triggerSystemHealthy = await this.workflowTriggerSystem.healthCheck();
      const coordinatorHealthy = await this.integrationCoordinator.healthCheck();
      const orchestratorHealthy = await this.eventDrivenOrchestrator.healthCheck();

      if (!triggerSystemHealthy) {
        throw new Error('Workflow trigger system health check failed');
      }

      if (!coordinatorHealthy) {
        throw new Error('Integration coordinator health check failed');
      }

      if (!orchestratorHealthy) {
        throw new Error('Event-driven orchestrator health check failed');
      }

      logger.info('All components initialized successfully');
    } catch (error) {
      logger.error('Component initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Start event subscription for real-time processing
   */
  private async startEventSubscription(): Promise<void> {
    try {
      logger.info('Starting event subscription for real-time processing');

      this.eventSubscription = this.supabase
        .channel('workflow-orchestration-events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'events',
          },
          async payload => {
            try {
              if (this.isRunning) {
                await this.processEventFromSubscription(payload.new);
              }
            } catch (error) {
              logger.error('Failed to process event from subscription', {
                eventId: payload.new.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          },
        )
        .subscribe();

      logger.info('Event subscription started successfully');
    } catch (error) {
      logger.error('Failed to start event subscription', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Process event from subscription
   */
  private async processEventFromSubscription(eventData: any): Promise<void> {
    try {
      const event: Event = {
        id: eventData.id,
        aggregateId: eventData.aggregate_id,
        aggregateType: eventData.aggregate_type,
        eventType: eventData.event_type,
        eventData: eventData.event_data,
        eventVersion: eventData.event_version,
        timestamp: new Date(eventData.timestamp),
        userId: eventData.user_id,
        correlationId: eventData.correlation_id,
        causationId: eventData.causation_id,
        metadata: eventData.metadata,
      };

      await this.processEvent(event);
    } catch (error) {
      logger.error('Failed to process event from subscription', {
        eventId: eventData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Process a single event through the orchestration pipeline
   */
  async processEvent(event: Event): Promise<OrchestrationResult> {
    try {
      logger.info('Processing event through orchestration service', {
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
      });

      if (!this.isRunning) {
        throw new Error('Orchestration service is not running');
      }

      // Process through event-driven orchestrator
      const result = await this.eventDrivenOrchestrator.processEvent(event);

      logger.info('Event processing completed', {
        eventId: event.id,
        success: result.success,
        workflowsTriggered: result.workflowsTriggered,
        integrationActionsExecuted: result.integrationActionsExecuted,
        totalDuration: result.totalDuration,
      });

      return result;
    } catch (error) {
      logger.error('Event processing failed', {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ServiceHealthStatus> {
    try {
      const [
        triggerSystemHealthy,
        coordinatorHealthy,
        orchestratorHealthy,
        databaseHealthy,
        triggerStats,
        coordinationStats,
        orchestratorMetrics,
      ] = await Promise.all([
        this.workflowTriggerSystem.healthCheck(),
        this.integrationCoordinator.healthCheck(),
        this.eventDrivenOrchestrator.healthCheck(),
        this.checkDatabaseHealth(),
        this.workflowTriggerSystem.getTriggerStatistics(),
        this.integrationCoordinator.getCoordinationStatistics(),
        Promise.resolve(this.eventDrivenOrchestrator.getMetrics()),
      ]);

      const overall =
        triggerSystemHealthy && coordinatorHealthy && orchestratorHealthy && databaseHealthy;

      return {
        overall,
        components: {
          workflowTriggers: triggerSystemHealthy,
          integrationCoordination: coordinatorHealthy,
          eventDrivenOrchestration: orchestratorHealthy,
          database: databaseHealthy,
        },
        metrics: {
          totalEventsProcessed: orchestratorMetrics.totalEventsProcessed,
          eventsProcessedToday: orchestratorMetrics.eventsProcessedToday,
          averageProcessingTime: orchestratorMetrics.averageProcessingTime,
          successRate: orchestratorMetrics.successRate,
          errorRate: orchestratorMetrics.errorRate,
          activeWorkflows: triggerStats.activeWorkflows,
          activeIntegrations: coordinationStats.activeIntegrations,
        },
      };
    } catch (error) {
      logger.error('Failed to get health status', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        overall: false,
        components: {
          workflowTriggers: false,
          integrationCoordination: false,
          eventDrivenOrchestration: false,
          database: false,
        },
        metrics: {
          totalEventsProcessed: 0,
          eventsProcessedToday: 0,
          averageProcessingTime: 0,
          successRate: 0,
          errorRate: 1,
          activeWorkflows: 0,
          activeIntegrations: 0,
        },
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('workflows').select('id').limit(1);
      return !error;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get service configuration
   */
  public getConfig(): OrchestrationServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<OrchestrationServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Service configuration updated', { config: this.config });
  }

  /**
   * Get processing queue status
   */
  public getProcessingQueueStatus(): {
    isRunning: boolean;
    queueSize: number;
    processingEvents: string[];
  } {
    return {
      isRunning: this.isRunning,
      queueSize: this.eventDrivenOrchestrator.getProcessingQueue().length,
      processingEvents: this.eventDrivenOrchestrator.getProcessingQueue(),
    };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.workflowTriggerSystem.clearCache();
    this.integrationCoordinator.clearCache();
    logger.info('All caches cleared');
  }

  /**
   * Reset daily metrics
   */
  public resetDailyMetrics(): void {
    this.eventDrivenOrchestrator.resetDailyMetrics();
    logger.info('Daily metrics reset');
  }

  /**
   * Get detailed statistics
   */
  public async getDetailedStatistics(): Promise<{
    triggerStatistics: any;
    coordinationStatistics: any;
    orchestrationMetrics: any;
  }> {
    try {
      const [triggerStats, coordinationStats, orchestrationMetrics] = await Promise.all([
        this.workflowTriggerSystem.getTriggerStatistics(),
        this.integrationCoordinator.getCoordinationStatistics(),
        Promise.resolve(this.eventDrivenOrchestrator.getMetrics()),
      ]);

      return {
        triggerStatistics: triggerStats,
        coordinationStatistics: coordinationStats,
        orchestrationMetrics,
      };
    } catch (error) {
      logger.error('Failed to get detailed statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
