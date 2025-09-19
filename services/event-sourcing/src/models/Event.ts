export interface Event {
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

export interface EventStore {
  saveEvent(event: Event): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<Event[]>;
  getEventsByType(eventType: string, limit?: number): Promise<Event[]>;
  getEventsByCorrelationId(correlationId: string): Promise<Event[]>;
}

export interface EventHandler {
  handle(event: Event): Promise<void>;
  canHandle(eventType: string): boolean;
}

export interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

// Event types for the Qylon system
export enum QylonEventTypes {
  // User Management Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ACTIVATED = 'user.activated',
  USER_DEACTIVATED = 'user.deactivated',

  // Client Management Events
  CLIENT_CREATED = 'client.created',
  CLIENT_UPDATED = 'client.updated',
  CLIENT_DELETED = 'client.deleted',
  CLIENT_ONBOARDED = 'client.onboarded',

  // Meeting Intelligence Events
  MEETING_CREATED = 'meeting.created',
  MEETING_STARTED = 'meeting.started',
  MEETING_ENDED = 'meeting.ended',
  MEETING_TRANSCRIBED = 'meeting.transcribed',
  MEETING_ANALYZED = 'meeting.analyzed',
  ACTION_ITEM_CREATED = 'action_item.created',
  ACTION_ITEM_COMPLETED = 'action_item.completed',

  // Content Creation Events
  CONTENT_CREATED = 'content.created',
  CONTENT_UPDATED = 'content.updated',
  CONTENT_PUBLISHED = 'content.published',
  CONTENT_ARCHIVED = 'content.archived',

  // Workflow Automation Events
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_STEP_COMPLETED = 'workflow.step_completed',
  WORKFLOW_STEP_FAILED = 'workflow.step_failed',

  // Integration Events
  INTEGRATION_CONNECTED = 'integration.connected',
  INTEGRATION_DISCONNECTED = 'integration.disconnected',
  INTEGRATION_SYNC_STARTED = 'integration.sync_started',
  INTEGRATION_SYNC_COMPLETED = 'integration.sync_completed',
  INTEGRATION_SYNC_FAILED = 'integration.sync_failed',

  // Notification Events
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_DELIVERED = 'notification.delivered',
  NOTIFICATION_FAILED = 'notification.failed',
  NOTIFICATION_READ = 'notification.read',

  // Analytics Events
  METRIC_RECORDED = 'metric.recorded',
  REPORT_GENERATED = 'report.generated',
  DASHBOARD_UPDATED = 'dashboard.updated',
}

// Aggregate types
export enum AggregateTypes {
  USER = 'user',
  CLIENT = 'client',
  MEETING = 'meeting',
  CONTENT = 'content',
  WORKFLOW = 'workflow',
  INTEGRATION = 'integration',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
}
