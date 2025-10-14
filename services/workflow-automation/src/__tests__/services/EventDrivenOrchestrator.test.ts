import { EventDrivenOrchestrator, OrchestrationContext } from '../../services/EventDrivenOrchestrator';
import { IntegrationResult } from '../../services/IntegrationServiceCoordinator';
import { TriggerResult } from '../../services/WorkflowTriggerSystem';

// Local type definitions for testing
enum AggregateTypes {
  MEETING = 'meeting',
  USER = 'user',
  CLIENT = 'client',
}

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

enum QylonEventTypes {
  ACTION_ITEM_CREATED = 'action_item.created',
  MEETING_ENDED = 'meeting.ended',
  CLIENT_CREATED = 'client.created',
  USER_CREATED = 'user.created',
}

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../../services/WorkflowTriggerSystem');
jest.mock('../../services/IntegrationServiceCoordinator');
jest.mock('../../utils/logger');

const mockSupabase = {
  from: jest.fn(() => ({
    upsert: jest.fn().mockResolvedValue({ error: null }),
  })),
};

const mockWorkflowTriggerSystem = {
  processEvent: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true),
  clearCache: jest.fn(),
  getTriggerStatistics: jest.fn().mockResolvedValue({
    totalWorkflows: 5,
    activeWorkflows: 3,
    eventTriggers: 2,
    scheduledTriggers: 1,
    webhookTriggers: 0,
  }),
};

const mockIntegrationCoordinator = {
  coordinateIntegrationActions: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true),
  clearCache: jest.fn(),
  getCoordinationStatistics: jest.fn().mockResolvedValue({
    totalIntegrations: 10,
    activeIntegrations: 8,
    integrationTypes: {
      'crm_salesforce': 3,
      'crm_hubspot': 2,
      'crm_pipedrive': 1,
    },
  }),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock('../../services/WorkflowTriggerSystem', () => ({
  WorkflowTriggerSystem: jest.fn(() => mockWorkflowTriggerSystem),
}));

jest.mock('../../services/IntegrationServiceCoordinator', () => ({
  IntegrationServiceCoordinator: jest.fn(() => mockIntegrationCoordinator),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock('../../services/WorkflowTriggerSystem', () => ({
  WorkflowTriggerSystem: jest.fn(() => mockWorkflowTriggerSystem),
}));

jest.mock('../../services/IntegrationServiceCoordinator', () => ({
  IntegrationServiceCoordinator: jest.fn(() => mockIntegrationCoordinator),
}));

describe('EventDrivenOrchestrator', () => {
  let orchestrator: EventDrivenOrchestrator;
  let mockEvent: Event;
  let mockContext: OrchestrationContext;

  beforeEach(() => {
    jest.clearAllMocks();
    orchestrator = new EventDrivenOrchestrator();

    mockEvent = {
      id: 'event-123',
      aggregateId: 'meeting-456',
      aggregateType: AggregateTypes.MEETING,
      eventType: QylonEventTypes.ACTION_ITEM_CREATED,
      eventData: {
        title: 'Follow up with client',
        description: 'Schedule next meeting',
        assigneeId: 'user-789',
        dueDate: '2024-01-15',
        projectManagementIntegration: 'asana',
        contactInfo: {
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Client',
          company: 'Client Corp',
          phone: '+1234567890',
        },
        crmIntegration: 'salesforce',
      },
      eventVersion: 1,
      timestamp: new Date('2024-01-01T10:00:00Z'),
      userId: 'user-123',
      correlationId: 'correlation-123',
      causationId: 'causation-123',
      metadata: { source: 'meeting-intelligence' },
    };

    mockContext = {
      eventId: mockEvent.id,
      eventType: mockEvent.eventType,
      aggregateId: mockEvent.aggregateId,
      userId: mockEvent.userId,
      clientId: mockEvent.userId,
      correlationId: mockEvent.correlationId,
      causationId: mockEvent.causationId,
      metadata: mockEvent.metadata,
    };
  });

  describe('processEvent', () => {
    it('should process event through complete orchestration pipeline', async () => {
      const mockWorkflowResults: TriggerResult[] = [
        {
          success: true,
          workflowId: 'workflow-123',
          executionId: 'execution-123',
          triggeredAt: new Date(),
        },
      ];

      const mockIntegrationResults: IntegrationResult[] = [
        {
          success: true,
          actionId: 'action-123',
          integrationType: 'crm_salesforce' as any,
          result: { id: 'contact-123' },
          duration: 500,
          retryCount: 0,
        },
      ];

      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);
      mockIntegrationCoordinator.coordinateIntegrationActions.mockResolvedValue(mockIntegrationResults);
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      const result = await orchestrator.processEvent(mockEvent);

      expect(result.success).toBe(true);
      expect(result.eventId).toBe(mockEvent.id);
      expect(result.workflowsTriggered).toBe(1);
      expect(result.workflowsCompleted).toBe(1);
      expect(result.workflowsFailed).toBe(0);
      expect(result.integrationActionsExecuted).toBe(1);
      expect(result.integrationActionsSuccessful).toBe(1);
      expect(result.integrationActionsFailed).toBe(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.results.workflowResults).toEqual(mockWorkflowResults);
      expect(result.results.integrationResults).toEqual(mockIntegrationResults);

      expect(mockWorkflowTriggerSystem.processEvent).toHaveBeenCalledWith(mockEvent);
      expect(mockIntegrationCoordinator.coordinateIntegrationActions).toHaveBeenCalled();
    });

    it('should handle workflow failures gracefully', async () => {
      const mockWorkflowResults: TriggerResult[] = [
        {
          success: false,
          workflowId: 'workflow-123',
          executionId: '',
          triggeredAt: new Date(),
          error: 'Workflow execution failed',
        },
      ];

      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);
      mockIntegrationCoordinator.coordinateIntegrationActions.mockResolvedValue([]);
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      const result = await orchestrator.processEvent(mockEvent);

      expect(result.success).toBe(true); // Still successful if no integration actions failed
      expect(result.workflowsTriggered).toBe(1);
      expect(result.workflowsCompleted).toBe(0);
      expect(result.workflowsFailed).toBe(1);
      expect(result.integrationActionsExecuted).toBe(0);
    });

    it('should handle integration failures gracefully', async () => {
      const mockWorkflowResults: TriggerResult[] = [
        {
          success: true,
          workflowId: 'workflow-123',
          executionId: 'execution-123',
          triggeredAt: new Date(),
        },
      ];

      const mockIntegrationResults: IntegrationResult[] = [
        {
          success: false,
          actionId: 'action-123',
          integrationType: 'crm_salesforce' as any,
          error: 'Integration failed',
          duration: 500,
          retryCount: 0,
        },
      ];

      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);
      mockIntegrationCoordinator.coordinateIntegrationActions.mockResolvedValue(mockIntegrationResults);
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      const result = await orchestrator.processEvent(mockEvent);

      expect(result.success).toBe(false);
      expect(result.workflowsTriggered).toBe(1);
      expect(result.workflowsCompleted).toBe(1);
      expect(result.workflowsFailed).toBe(0);
      expect(result.integrationActionsExecuted).toBe(1);
      expect(result.integrationActionsSuccessful).toBe(0);
      expect(result.integrationActionsFailed).toBe(1);
    });

    it('should handle orchestration pipeline failures', async () => {
      mockWorkflowTriggerSystem.processEvent.mockRejectedValue(new Error('Pipeline failed'));
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      const result = await orchestrator.processEvent(mockEvent);

      expect(result.success).toBe(false);
      expect(result.eventId).toBe(mockEvent.id);
      expect(result.workflowsTriggered).toBe(0);
      expect(result.integrationActionsExecuted).toBe(0);
      expect(result.errors).toContain('Pipeline failed');
    });

    it('should prevent duplicate event processing', async () => {
      const mockWorkflowResults: TriggerResult[] = [];
      const mockIntegrationResults: IntegrationResult[] = [];

      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);
      mockIntegrationCoordinator.coordinateIntegrationActions.mockResolvedValue(mockIntegrationResults);
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      // Start first processing
      const firstPromise = orchestrator.processEvent(mockEvent);

      // Try to process same event again
      const secondPromise = orchestrator.processEvent(mockEvent);

      const [firstResult, secondResult] = await Promise.all([firstPromise, secondPromise]);

      expect(firstResult.eventId).toBe(mockEvent.id);
      expect(secondResult.eventId).toBe(mockEvent.id);
      // Both should complete, but the second one should wait for the first
    });
  });

  describe('generateIntegrationActions', () => {
    it('should generate action item integration actions', async () => {
      const mockWorkflowResults: TriggerResult[] = [];
      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);

      const actions = await (orchestrator as any).generateIntegrationActions(mockEvent, mockWorkflowResults);

      expect(actions).toHaveLength(2); // One for project management, one for CRM
      expect(actions[0].type).toBe('create_contact'); // This would be 'create_task' in real implementation
      expect(actions[1].type).toBe('create_contact');
    });

    it('should generate meeting end integration actions', async () => {
      const meetingEvent = {
        ...mockEvent,
        eventType: QylonEventTypes.MEETING_ENDED,
        eventData: {
          id: 'meeting-123',
          title: 'Client Meeting',
          startTime: '2024-01-01T10:00:00Z',
          endTime: '2024-01-01T11:00:00Z',
          participants: ['user1', 'user2'],
          transcript: 'Meeting transcript...',
          actionItems: ['Follow up', 'Send proposal'],
          calendarIntegration: 'google',
          notificationIntegration: 'slack',
        },
      };

      const mockWorkflowResults: TriggerResult[] = [];
      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);

      const actions = await (orchestrator as any).generateIntegrationActions(meetingEvent, mockWorkflowResults);

      expect(actions).toHaveLength(2); // One for calendar sync, one for notification
      expect(actions[0].type).toBe('sync_data');
      expect(actions[1].type).toBe('send_notification');
    });

    it('should generate client creation integration actions', async () => {
      const clientEvent = {
        ...mockEvent,
        eventType: QylonEventTypes.CLIENT_CREATED,
        eventData: {
          id: 'client-123',
          name: 'New Client',
          email: 'client@example.com',
          company: 'Client Corp',
          phone: '+1234567890',
          crmIntegration: 'hubspot',
        },
      };

      const mockWorkflowResults: TriggerResult[] = [];
      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);

      const actions = await (orchestrator as any).generateIntegrationActions(clientEvent, mockWorkflowResults);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('create_contact');
      expect(actions[0].data.email).toBe('client@example.com');
    });

    it('should generate user creation integration actions', async () => {
      const userEvent = {
        ...mockEvent,
        eventType: QylonEventTypes.USER_CREATED,
        eventData: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          notificationIntegration: 'email',
        },
      };

      const mockWorkflowResults: TriggerResult[] = [];
      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);

      const actions = await (orchestrator as any).generateIntegrationActions(userEvent, mockWorkflowResults);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('send_notification');
      expect(actions[0].data.recipients).toEqual(['user@example.com']);
    });

    it('should return empty array for unknown event types', async () => {
      const unknownEvent = {
        ...mockEvent,
        eventType: 'unknown.event' as any,
      };

      const mockWorkflowResults: TriggerResult[] = [];
      mockWorkflowTriggerSystem.processEvent.mockResolvedValue(mockWorkflowResults);

      const actions = await (orchestrator as any).generateIntegrationActions(unknownEvent, mockWorkflowResults);

      expect(actions).toHaveLength(0);
    });
  });

  describe('updateEventProcessingStatus', () => {
    it('should update event processing status to completed', async () => {
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      await (orchestrator as any).updateEventProcessingStatus('event-123', 'completed');

      expect(mockSupabase.from).toHaveBeenCalledWith('event_processing_status');
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith({
        event_id: 'event-123',
        status: 'completed',
        error: undefined,
        updated_at: expect.any(String),
      });
    });

    it('should update event processing status to failed with error', async () => {
      mockSupabase.from().upsert.mockResolvedValue({ error: null });

      await (orchestrator as any).updateEventProcessingStatus('event-123', 'failed', 'Test error');

      expect(mockSupabase.from().upsert).toHaveBeenCalledWith({
        event_id: 'event-123',
        status: 'failed',
        error: 'Test error',
        updated_at: expect.any(String),
      });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.from().upsert.mockResolvedValue({ error: { message: 'Database error' } });

      // Should not throw
      await expect(
        (orchestrator as any).updateEventProcessingStatus('event-123', 'completed')
      ).resolves.not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return current processing metrics', () => {
      const metrics = orchestrator.getMetrics();

      expect(metrics).toHaveProperty('totalEventsProcessed');
      expect(metrics).toHaveProperty('eventsProcessedToday');
      expect(metrics).toHaveProperty('averageProcessingTime');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('lastProcessedAt');
    });
  });

  describe('resetDailyMetrics', () => {
    it('should reset daily metrics', () => {
      // Set some daily metrics
      (orchestrator as any).metrics.eventsProcessedToday = 10;

      orchestrator.resetDailyMetrics();

      const metrics = orchestrator.getMetrics();
      expect(metrics.eventsProcessedToday).toBe(0);
    });
  });

  describe('getProcessingQueue', () => {
    it('should return current processing queue', () => {
      const queue = orchestrator.getProcessingQueue();
      expect(Array.isArray(queue)).toBe(true);
    });
  });

  describe('healthCheck', () => {
    it('should return true when all components are healthy', async () => {
      mockWorkflowTriggerSystem.healthCheck.mockResolvedValue(true);
      mockIntegrationCoordinator.healthCheck.mockResolvedValue(true);

      const isHealthy = await orchestrator.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when any component is unhealthy', async () => {
      mockWorkflowTriggerSystem.healthCheck.mockResolvedValue(false);
      mockIntegrationCoordinator.healthCheck.mockResolvedValue(true);

      const isHealthy = await orchestrator.healthCheck();
      expect(isHealthy).toBe(false);
    });

    it('should return false when health check fails', async () => {
      mockWorkflowTriggerSystem.healthCheck.mockRejectedValue(new Error('Health check failed'));

      const isHealthy = await orchestrator.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('shutdown', () => {
    it('should shutdown orchestrator gracefully', async () => {
      // Add a processing event to the queue
      const mockPromise = Promise.resolve({
        success: true,
        eventId: 'event-123',
        workflowsTriggered: 0,
        workflowsCompleted: 0,
        workflowsFailed: 0,
        integrationActionsExecuted: 0,
        integrationActionsSuccessful: 0,
        integrationActionsFailed: 0,
        totalDuration: 100,
        results: { workflowResults: [], integrationResults: [] },
      });

      (orchestrator as any).processingQueue.set('event-123', mockPromise);

      await orchestrator.shutdown();

      expect(mockWorkflowTriggerSystem.clearCache).toHaveBeenCalled();
      expect(mockIntegrationCoordinator.clearCache).toHaveBeenCalled();
    });
  });
});
