import { Event } from '../models/Event';
import { logger } from '../utils/logger';

export interface EventProcessingMetrics {
  totalEventsProcessed: number;
  successfulEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
  eventsByType: Record<string, number>;
  eventsByAggregateType: Record<string, number>;
  lastProcessedAt?: string;
  processingErrors: Array<{
    eventId: string;
    error: string;
    timestamp: string;
  }>;
}

export interface WorkflowTriggerMetrics {
  totalTriggersExecuted: number;
  successfulTriggers: number;
  failedTriggers: number;
  averageTriggerTime: number;
  triggersByEventType: Record<string, number>;
  triggersByWorkflowId: Record<string, number>;
  triggerErrors: Array<{
    triggerId: string;
    error: string;
    timestamp: string;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  eventProcessing: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    successRate: number;
    averageProcessingTime: number;
  };
  workflowTriggers: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    successRate: number;
    averageTriggerTime: number;
  };
  recommendations: string[];
  lastUpdated: string;
}

export class EventProcessingMonitor {
  private eventMetrics: EventProcessingMetrics = {
    totalEventsProcessed: 0,
    successfulEvents: 0,
    failedEvents: 0,
    averageProcessingTime: 0,
    eventsByType: {},
    eventsByAggregateType: {},
    processingErrors: [],
  };

  private workflowMetrics: WorkflowTriggerMetrics = {
    totalTriggersExecuted: 0,
    successfulTriggers: 0,
    failedTriggers: 0,
    averageTriggerTime: 0,
    triggersByEventType: {},
    triggersByWorkflowId: {},
    triggerErrors: [],
  };

  private processingTimes: number[] = [];
  private triggerTimes: number[] = [];

  /**
   * Record the start of event processing
   */
  recordEventProcessingStart(eventId: string): void {
    // This could be used for more detailed tracking if needed
    logger.debug('Event processing started', { eventId });
  }

  /**
   * Record successful event processing
   */
  recordEventProcessingSuccess(event: Event, processingTime: number): void {
    this.eventMetrics.totalEventsProcessed++;
    this.eventMetrics.successfulEvents++;
    this.eventMetrics.lastProcessedAt = new Date().toISOString();

    // Update event type counts
    this.eventMetrics.eventsByType[event.eventType] =
      (this.eventMetrics.eventsByType[event.eventType] || 0) + 1;

    // Update aggregate type counts
    this.eventMetrics.eventsByAggregateType[event.aggregateType] =
      (this.eventMetrics.eventsByAggregateType[event.aggregateType] || 0) + 1;

    // Update processing times
    this.processingTimes.push(processingTime);
    this.eventMetrics.averageProcessingTime = this.calculateAverage(
      this.processingTimes,
    );

    logger.debug('Event processing completed successfully', {
      eventId: event.id,
      eventType: event.eventType,
      processingTimeMs: processingTime,
      totalEventsProcessed: this.eventMetrics.totalEventsProcessed,
    });
  }

  /**
   * Record failed event processing
   */
  recordEventProcessingError(
    event: Event,
    error: Error,
    processingTime: number,
  ): void {
    this.eventMetrics.totalEventsProcessed++;
    this.eventMetrics.failedEvents++;
    this.eventMetrics.lastProcessedAt = new Date().toISOString();

    // Record error details
    this.eventMetrics.processingErrors.push({
      eventId: event.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 errors
    if (this.eventMetrics.processingErrors.length > 100) {
      this.eventMetrics.processingErrors =
        this.eventMetrics.processingErrors.slice(-100);
    }

    // Update processing times
    this.processingTimes.push(processingTime);
    this.eventMetrics.averageProcessingTime = this.calculateAverage(
      this.processingTimes,
    );

    logger.error('Event processing failed', {
      eventId: event.id,
      eventType: event.eventType,
      error: error.message,
      processingTimeMs: processingTime,
      totalFailedEvents: this.eventMetrics.failedEvents,
    });
  }

  /**
   * Record the start of workflow trigger execution
   */
  recordWorkflowTriggerStart(triggerId: string): void {
    logger.debug('Workflow trigger started', { triggerId });
  }

  /**
   * Record successful workflow trigger execution
   */
  recordWorkflowTriggerSuccess(triggerId: string, triggerTime: number): void {
    this.workflowMetrics.totalTriggersExecuted++;
    this.workflowMetrics.successfulTriggers++;

    // Update trigger times
    this.triggerTimes.push(triggerTime);
    this.workflowMetrics.averageTriggerTime = this.calculateAverage(
      this.triggerTimes,
    );

    logger.debug('Workflow trigger executed successfully', {
      triggerId,
      triggerTimeMs: triggerTime,
      totalTriggersExecuted: this.workflowMetrics.totalTriggersExecuted,
    });
  }

  /**
   * Record failed workflow trigger execution
   */
  recordWorkflowTriggerError(
    triggerId: string,
    error: Error,
    triggerTime: number,
  ): void {
    this.workflowMetrics.totalTriggersExecuted++;
    this.workflowMetrics.failedTriggers++;

    // Record error details
    this.workflowMetrics.triggerErrors.push({
      triggerId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 errors
    if (this.workflowMetrics.triggerErrors.length > 100) {
      this.workflowMetrics.triggerErrors =
        this.workflowMetrics.triggerErrors.slice(-100);
    }

    // Update trigger times
    this.triggerTimes.push(triggerTime);
    this.workflowMetrics.averageTriggerTime = this.calculateAverage(
      this.triggerTimes,
    );

    logger.error('Workflow trigger execution failed', {
      triggerId,
      error: error.message,
      triggerTimeMs: triggerTime,
      totalFailedTriggers: this.workflowMetrics.failedTriggers,
    });
  }

  /**
   * Get event processing metrics
   */
  getEventProcessingMetrics(): EventProcessingMetrics {
    return { ...this.eventMetrics };
  }

  /**
   * Get workflow trigger metrics
   */
  getWorkflowTriggerMetrics(): WorkflowTriggerMetrics {
    return { ...this.workflowMetrics };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const eventSuccessRate =
      this.eventMetrics.totalEventsProcessed > 0
        ? (this.eventMetrics.successfulEvents /
            this.eventMetrics.totalEventsProcessed) *
          100
        : 100;

    const triggerSuccessRate =
      this.workflowMetrics.totalTriggersExecuted > 0
        ? (this.workflowMetrics.successfulTriggers /
            this.workflowMetrics.totalTriggersExecuted) *
          100
        : 100;

    const eventProcessingStatus = this.getHealthStatus(
      eventSuccessRate,
      this.eventMetrics.averageProcessingTime,
    );
    const workflowTriggerStatus = this.getHealthStatus(
      triggerSuccessRate,
      this.workflowMetrics.averageTriggerTime,
    );

    const overallStatus = this.getOverallHealthStatus(
      eventProcessingStatus,
      workflowTriggerStatus,
    );

    const recommendations = this.generateRecommendations(
      eventSuccessRate,
      triggerSuccessRate,
      this.eventMetrics.averageProcessingTime,
      this.workflowMetrics.averageTriggerTime,
    );

    return {
      status: overallStatus,
      eventProcessing: {
        status: eventProcessingStatus,
        successRate: eventSuccessRate,
        averageProcessingTime: this.eventMetrics.averageProcessingTime,
      },
      workflowTriggers: {
        status: workflowTriggerStatus,
        successRate: triggerSuccessRate,
        averageTriggerTime: this.workflowMetrics.averageTriggerTime,
      },
      recommendations,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics(): void {
    this.eventMetrics = {
      totalEventsProcessed: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageProcessingTime: 0,
      eventsByType: {},
      eventsByAggregateType: {},
      processingErrors: [],
    };

    this.workflowMetrics = {
      totalTriggersExecuted: 0,
      successfulTriggers: 0,
      failedTriggers: 0,
      averageTriggerTime: 0,
      triggersByEventType: {},
      triggersByWorkflowId: {},
      triggerErrors: [],
    };

    this.processingTimes = [];
    this.triggerTimes = [];

    logger.info('Event processing metrics reset');
  }

  /**
   * Calculate average from array of numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Determine health status based on success rate and performance
   */
  private getHealthStatus(
    successRate: number,
    averageTime: number,
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (successRate >= 95 && averageTime < 1000) {
      return 'healthy';
    } else if (successRate >= 80 && averageTime < 5000) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  /**
   * Determine overall system health status
   */
  private getOverallHealthStatus(
    eventStatus: 'healthy' | 'degraded' | 'unhealthy',
    triggerStatus: 'healthy' | 'degraded' | 'unhealthy',
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (eventStatus === 'unhealthy' || triggerStatus === 'unhealthy') {
      return 'unhealthy';
    } else if (eventStatus === 'degraded' || triggerStatus === 'degraded') {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Generate health recommendations
   */
  private generateRecommendations(
    eventSuccessRate: number,
    triggerSuccessRate: number,
    avgEventTime: number,
    avgTriggerTime: number,
  ): string[] {
    const recommendations: string[] = [];

    if (eventSuccessRate < 95) {
      recommendations.push(
        'Event processing success rate is below 95%. Check for system errors and event validation issues.',
      );
    }

    if (triggerSuccessRate < 95) {
      recommendations.push(
        'Workflow trigger success rate is below 95%. Verify workflow definitions and automation service connectivity.',
      );
    }

    if (avgEventTime > 1000) {
      recommendations.push(
        'Event processing time is above 1 second. Consider optimizing event handling logic.',
      );
    }

    if (avgTriggerTime > 5000) {
      recommendations.push(
        'Workflow trigger execution time is above 5 seconds. Check workflow automation service performance.',
      );
    }

    if (this.eventMetrics.failedEvents > 10) {
      recommendations.push(
        'High number of failed events detected. Review error logs and system stability.',
      );
    }

    if (this.workflowMetrics.failedTriggers > 5) {
      recommendations.push(
        'High number of failed workflow triggers. Verify workflow automation service health.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters.');
    }

    return recommendations;
  }
}
