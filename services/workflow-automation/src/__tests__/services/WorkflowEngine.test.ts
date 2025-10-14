import { WorkflowEngine } from '../../services/WorkflowEngine';
import { WorkflowDefinition } from '../../types/WorkflowDefinition';

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
  });

  describe('Workflow Execution', () => {
    it('should execute a simple workflow successfully', async () => {
      const workflowDef: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        steps: [
          {
            id: 'step1',
            type: 'action',
            action: 'send-email',
            parameters: { to: 'test@example.com', subject: 'Test' }
          }
        ]
      };

      const result = await workflowEngine.executeWorkflow(workflowDef, {});

      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
    });

    it('should handle workflow errors gracefully', async () => {
      const workflowDef: WorkflowDefinition = {
        id: 'error-workflow',
        name: 'Error Workflow',
        steps: [
          {
            id: 'error-step',
            type: 'action',
            action: 'invalid-action',
            parameters: {}
          }
        ]
      };

      const result = await workflowEngine.executeWorkflow(workflowDef, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should support conditional steps', async () => {
      const workflowDef: WorkflowDefinition = {
        id: 'conditional-workflow',
        name: 'Conditional Workflow',
        steps: [
          {
            id: 'condition',
            type: 'condition',
            condition: 'user.role === "admin"',
            trueSteps: [
              {
                id: 'admin-action',
                type: 'action',
                action: 'admin-notification',
                parameters: {}
              }
            ],
            falseSteps: [
              {
                id: 'user-action',
                type: 'action',
                action: 'user-notification',
                parameters: {}
              }
            ]
          }
        ]
      };

      const result = await workflowEngine.executeWorkflow(workflowDef, { user: { role: 'admin' } });

      expect(result.success).toBe(true);
      expect(result.executedSteps).toContain('admin-action');
      expect(result.executedSteps).not.toContain('user-action');
    });
  });

  describe('Workflow State Management', () => {
    it('should persist workflow state', async () => {
      const workflowDef: WorkflowDefinition = {
        id: 'state-workflow',
        name: 'State Workflow',
        steps: [
          {
            id: 'step1',
            type: 'action',
            action: 'set-variable',
            parameters: { name: 'testVar', value: 'testValue' }
          }
        ]
      };

      const result = await workflowEngine.executeWorkflow(workflowDef, {});

      expect(result.success).toBe(true);
      expect(result.state).toHaveProperty('testVar', 'testValue');
    });
  });
});
