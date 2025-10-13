import { WorkflowTriggerSystem } from '../../services/WorkflowTriggerSystem';
import { TriggerType, Workflow } from '../../types';

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
jest.mock('../../services/WorkflowEngine');
jest.mock('../../utils/logger');

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

const mockWorkflowEngine = {
  executeWorkflowFromEvent: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock('../../services/WorkflowEngine', () => ({
  WorkflowEngine: jest.fn(() => mockWorkflowEngine),
}));

describe('WorkflowTriggerSystem', () => {
  let triggerSystem: WorkflowTriggerSystem;
  let mockEvent: Event;
  let mockWorkflow: Workflow;

  beforeEach(() => {
    jest.clearAllMocks();
    triggerSystem = new WorkflowTriggerSystem();

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
      },
      eventVersion: 1,
      timestamp: new Date('2024-01-01T10:00:00Z'),
      userId: 'user-123',
      correlationId: 'correlation-123',
      causationId: 'causation-123',
      metadata: { source: 'meeting-intelligence' },
    };

    mockWorkflow = {
      id: 'workflow-123',
      client_id: 'user-123',
      name: 'Action Item Workflow',
      description: 'Processes action items from meetings',
      definition: {
        id: 'workflow-def-123',
        name: 'Action Item Workflow',
        version: '1.0.0',
        triggers: [
          {
            id: 'trigger-123',
            type: TriggerType.EVENT,
            name: 'Action Item Created Trigger',
            config: {
              event_type: QylonEventTypes.ACTION_ITEM_CREATED,
              aggregate_type: AggregateTypes.MEETING,
            },
            enabled: true,
          },
        ],
        states: [],
        transitions: [],
      },
      status: 'active' as any,
      version: 1,
      is_active: true,
      created_at: new Date('2024-01-01T09:00:00Z'),
      updated_at: new Date('2024-01-01T09:00:00Z'),
    };
  });

  describe('processEvent', () => {
    it('should process event and trigger matching workflows', async () => {
      // Mock database response
      mockSupabase.from().single.mockResolvedValue({
        data: {
          id: mockWorkflow.id,
          client_id: mockWorkflow.client_id,
          name: mockWorkflow.name,
          description: mockWorkflow.description,
          definition: mockWorkflow.definition,
          status: mockWorkflow.status,
          version: mockWorkflow.version,
          is_active: mockWorkflow.is_active,
          created_at: mockWorkflow.created_at.toISOString(),
          updated_at: mockWorkflow.updated_at.toISOString(),
        },
        error: null,
      });

      // Mock workflow execution
      mockWorkflowEngine.executeWorkflowFromEvent.mockResolvedValue({
        id: 'execution-123',
        workflow_id: mockWorkflow.id,
        client_id: mockWorkflow.client_id,
        status: 'pending' as any,
        context: {},
        started_at: new Date(),
      });

      const results = await triggerSystem.processEvent(mockEvent);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].workflowId).toBe(mockWorkflow.id);
      expect(results[0].executionId).toBe('execution-123');
      expect(mockWorkflowEngine.executeWorkflowFromEvent).toHaveBeenCalledWith(
        mockWorkflow.id,
        expect.objectContaining({
          event: expect.objectContaining({
            id: mockEvent.id,
            type: mockEvent.eventType,
            aggregateId: mockEvent.aggregateId,
          }),
        }),
        expect.any(Object),
        expect.objectContaining({
          eventId: mockEvent.id,
          eventType: mockEvent.eventType,
          aggregateId: mockEvent.aggregateId,
        })
      );
    });

    it('should return empty array when no matching workflows found', async () => {
      // Mock empty database response
      mockSupabase.from().single.mockResolvedValue({
        data: [],
        error: null,
      });

      const results = await triggerSystem.processEvent(mockEvent);

      expect(results).toHaveLength(0);
      expect(mockWorkflowEngine.executeWorkflowFromEvent).not.toHaveBeenCalled();
    });

    it('should handle workflow execution failures gracefully', async () => {
      // Mock database response
      mockSupabase.from().single.mockResolvedValue({
        data: {
          id: mockWorkflow.id,
          client_id: mockWorkflow.client_id,
          name: mockWorkflow.name,
          description: mockWorkflow.description,
          definition: mockWorkflow.definition,
          status: mockWorkflow.status,
          version: mockWorkflow.version,
          is_active: mockWorkflow.is_active,
          created_at: mockWorkflow.created_at.toISOString(),
          updated_at: mockWorkflow.updated_at.toISOString(),
        },
        error: null,
      });

      // Mock workflow execution failure
      mockWorkflowEngine.executeWorkflowFromEvent.mockRejectedValue(
        new Error('Workflow execution failed')
      );

      const results = await triggerSystem.processEvent(mockEvent);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].workflowId).toBe(mockWorkflow.id);
      expect(results[0].error).toBe('Workflow execution failed');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const results = await triggerSystem.processEvent(mockEvent);

      expect(results).toHaveLength(0);
      expect(mockWorkflowEngine.executeWorkflowFromEvent).not.toHaveBeenCalled();
    });
  });

  describe('hasMatchingTrigger', () => {
    it('should match event type and aggregate type', () => {
      const workflow = {
        ...mockWorkflow,
        definition: {
          ...mockWorkflow.definition,
          triggers: [
            {
              id: 'trigger-123',
              type: TriggerType.EVENT,
              name: 'Action Item Created Trigger',
              config: {
                event_type: QylonEventTypes.ACTION_ITEM_CREATED,
                aggregate_type: AggregateTypes.MEETING,
              },
              enabled: true,
            },
          ],
        },
      };

      const hasMatch = (triggerSystem as any).hasMatchingTrigger(workflow, mockEvent);
      expect(hasMatch).toBe(true);
    });

    it('should not match disabled triggers', () => {
      const workflow = {
        ...mockWorkflow,
        definition: {
          ...mockWorkflow.definition,
          triggers: [
            {
              id: 'trigger-123',
              type: TriggerType.EVENT,
              name: 'Action Item Created Trigger',
              config: {
                event_type: QylonEventTypes.ACTION_ITEM_CREATED,
                aggregate_type: AggregateTypes.MEETING,
              },
              enabled: false,
            },
          ],
        },
      };

      const hasMatch = (triggerSystem as any).hasMatchingTrigger(workflow, mockEvent);
      expect(hasMatch).toBe(false);
    });

    it('should not match different event types', () => {
      const workflow = {
        ...mockWorkflow,
        definition: {
          ...mockWorkflow.definition,
          triggers: [
            {
              id: 'trigger-123',
              type: TriggerType.EVENT,
              name: 'Meeting Ended Trigger',
              config: {
                event_type: QylonEventTypes.MEETING_ENDED,
                aggregate_type: AggregateTypes.MEETING,
              },
              enabled: true,
            },
          ],
        },
      };

      const hasMatch = (triggerSystem as any).hasMatchingTrigger(workflow, mockEvent);
      expect(hasMatch).toBe(false);
    });

    it('should not match different client IDs', () => {
      const workflow = {
        ...mockWorkflow,
        client_id: 'different-client',
        definition: {
          ...mockWorkflow.definition,
          triggers: [
            {
              id: 'trigger-123',
              type: TriggerType.EVENT,
              name: 'Action Item Created Trigger',
              config: {
                event_type: QylonEventTypes.ACTION_ITEM_CREATED,
                aggregate_type: AggregateTypes.MEETING,
              },
              enabled: true,
            },
          ],
        },
      };

      const hasMatch = (triggerSystem as any).hasMatchingTrigger(workflow, mockEvent);
      expect(hasMatch).toBe(false);
    });
  });

  describe('evaluateTriggerConditions', () => {
    it('should evaluate equals condition correctly', () => {
      const conditions = [
        {
          field: 'title',
          operator: 'equals',
          value: 'Follow up with client',
        },
      ];

      const result = (triggerSystem as any).evaluateTriggerConditions(conditions, mockEvent);
      expect(result).toBe(true);
    });

    it('should evaluate not_equals condition correctly', () => {
      const conditions = [
        {
          field: 'title',
          operator: 'not_equals',
          value: 'Different title',
        },
      ];

      const result = (triggerSystem as any).evaluateTriggerConditions(conditions, mockEvent);
      expect(result).toBe(true);
    });

    it('should evaluate contains condition correctly', () => {
      const conditions = [
        {
          field: 'title',
          operator: 'contains',
          value: 'Follow up',
        },
      ];

      const result = (triggerSystem as any).evaluateTriggerConditions(conditions, mockEvent);
      expect(result).toBe(true);
    });

    it('should evaluate exists condition correctly', () => {
      const conditions = [
        {
          field: 'assigneeId',
          operator: 'exists',
          value: null,
        },
      ];

      const result = (triggerSystem as any).evaluateTriggerConditions(conditions, mockEvent);
      expect(result).toBe(true);
    });

    it('should return false for failed conditions', () => {
      const conditions = [
        {
          field: 'title',
          operator: 'equals',
          value: 'Different title',
        },
      ];

      const result = (triggerSystem as any).evaluateTriggerConditions(conditions, mockEvent);
      expect(result).toBe(false);
    });
  });

  describe('getTriggerStatistics', () => {
    it('should return trigger statistics', async () => {
      const mockData = [
        {
          id: 'workflow-1',
          is_active: true,
          definition: {
            triggers: [
              { type: TriggerType.EVENT, enabled: true },
              { type: TriggerType.SCHEDULED, enabled: true },
            ],
          },
        },
        {
          id: 'workflow-2',
          is_active: false,
          definition: {
            triggers: [
              { type: TriggerType.WEBHOOK, enabled: true },
            ],
          },
        },
      ];

      mockSupabase.from().select.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const stats = await triggerSystem.getTriggerStatistics();

      expect(stats.totalWorkflows).toBe(2);
      expect(stats.activeWorkflows).toBe(1);
      expect(stats.eventTriggers).toBe(1);
      expect(stats.scheduledTriggers).toBe(1);
      expect(stats.webhookTriggers).toBe(1);
    });

    it('should handle database errors in statistics', async () => {
      mockSupabase.from().select.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const stats = await triggerSystem.getTriggerStatistics();

      expect(stats.totalWorkflows).toBe(0);
      expect(stats.activeWorkflows).toBe(0);
      expect(stats.eventTriggers).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is accessible', async () => {
      mockSupabase.from().select.mockResolvedValue({
        data: [],
        error: null,
      });

      const isHealthy = await triggerSystem.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when database is not accessible', async () => {
      mockSupabase.from().select.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      const isHealthy = await triggerSystem.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear trigger cache', () => {
      // Add some data to cache
      (triggerSystem as any).triggerCache.set('test-key', [mockWorkflow]);
      (triggerSystem as any).cacheExpiry.set('test-key', Date.now() + 1000);

      triggerSystem.clearCache();

      expect((triggerSystem as any).triggerCache.size).toBe(0);
      expect((triggerSystem as any).cacheExpiry.size).toBe(0);
    });
  });
});
