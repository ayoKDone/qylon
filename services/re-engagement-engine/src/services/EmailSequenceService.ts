import sgMail from '@sendgrid/mail';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateEmailSequenceRequest,
  EmailDelivery,
  EmailProviderConfig,
  EmailSequence,
  EmailSequenceExecution,
  EmailStep,
  UpdateEmailSequenceRequest,
} from '../types';
import { logBusinessEvent, logger } from '../utils/logger';

export class EmailSequenceService {
  private supabase: any;
  private emailProvider: EmailProviderConfig;

  constructor(supabaseUrl: string, supabaseKey: string, emailProvider: EmailProviderConfig) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.emailProvider = emailProvider;

    if (emailProvider.provider === 'sendgrid' && emailProvider.apiKey) {
      sgMail.setApiKey(emailProvider.apiKey);
    }
  }

  /**
   * Create a new email sequence
   */
  async createEmailSequence(
    userId: string,
    request: CreateEmailSequenceRequest,
  ): Promise<EmailSequence> {
    try {
      const sequenceId = uuidv4();
      const now = new Date().toISOString();

      // Create the email sequence
      const sequence: EmailSequence = {
        id: sequenceId,
        name: request.name,
        description: request.description,
        triggerEvent: request.triggerEvent,
        steps: [],
        isActive: true,
        userId,
        clientId: request.clientId,
        createdAt: now,
        updatedAt: now,
      };

      // Insert sequence into database
      const { data: sequenceData, error: sequenceError } = await this.supabase
        .from('email_sequences')
        .insert([sequence])
        .select()
        .single();

      if (sequenceError) {
        throw new Error(`Failed to create email sequence: ${sequenceError.message}`);
      }

      // Create email steps
      const steps: EmailStep[] = [];
      for (let i = 0; i < request.steps.length; i++) {
        const stepRequest = request.steps[i];
        if (!stepRequest) continue;

        const step: EmailStep = {
          id: uuidv4(),
          sequenceId,
          stepNumber: i + 1,
          delayHours: stepRequest.delayHours,
          subject: stepRequest.subject,
          template: stepRequest.template,
          variables: stepRequest.variables,
          conditions: stepRequest.conditions || [],
          isActive: stepRequest.isActive,
          createdAt: now,
          updatedAt: now,
        };

        const { data: stepData, error: stepError } = await this.supabase
          .from('email_steps')
          .insert([step])
          .select()
          .single();

        if (stepError) {
          throw new Error(`Failed to create email step: ${stepError.message}`);
        }

        steps.push(stepData);
      }

      const result = { ...sequenceData, steps };

      logBusinessEvent('email_sequence_created', {
        sequenceId,
        userId,
        clientId: request.clientId,
        stepCount: steps.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to create email sequence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        request,
      });
      throw error;
    }
  }

  /**
   * Update an existing email sequence
   */
  async updateEmailSequence(
    sequenceId: string,
    userId: string,
    request: UpdateEmailSequenceRequest,
  ): Promise<EmailSequence> {
    try {
      const now = new Date().toISOString();

      // Update sequence
      const updateData: Partial<EmailSequence> = {
        updatedAt: now,
      };

      if (request.name !== undefined) updateData.name = request.name;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.triggerEvent !== undefined) updateData.triggerEvent = request.triggerEvent;
      if (request.isActive !== undefined) updateData.isActive = request.isActive;

      const { data: sequenceData, error: sequenceError } = await this.supabase
        .from('email_sequences')
        .update(updateData)
        .eq('id', sequenceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (sequenceError) {
        throw new Error(`Failed to update email sequence: ${sequenceError.message}`);
      }

      // Update steps if provided
      if (request.steps) {
        // Delete existing steps
        await this.supabase.from('email_steps').delete().eq('sequence_id', sequenceId);

        // Create new steps
        const steps: EmailStep[] = [];
        for (let i = 0; i < request.steps.length; i++) {
          const stepRequest = request.steps[i];
          if (!stepRequest) continue;

          const step: EmailStep = {
            id: uuidv4(),
            sequenceId,
            stepNumber: i + 1,
            delayHours: stepRequest.delayHours,
            subject: stepRequest.subject,
            template: stepRequest.template,
            variables: stepRequest.variables,
            conditions: stepRequest.conditions || [],
            isActive: stepRequest.isActive,
            createdAt: now,
            updatedAt: now,
          };

          const { data: stepData, error: stepError } = await this.supabase
            .from('email_steps')
            .insert([step])
            .select()
            .single();

          if (stepError) {
            throw new Error(`Failed to update email step: ${stepError.message}`);
          }

          steps.push(stepData);
        }

        sequenceData.steps = steps;
      } else {
        // Get existing steps
        const { data: steps, error: stepsError } = await this.supabase
          .from('email_steps')
          .select('*')
          .eq('sequence_id', sequenceId)
          .order('step_number');

        if (stepsError) {
          throw new Error(`Failed to get email steps: ${stepsError.message}`);
        }

        sequenceData.steps = steps;
      }

      logBusinessEvent('email_sequence_updated', {
        sequenceId,
        userId,
        updates: Object.keys(updateData),
      });

      return sequenceData;
    } catch (error) {
      logger.error('Failed to update email sequence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sequenceId,
        userId,
        request,
      });
      throw error;
    }
  }

  /**
   * Get email sequences for a user
   */
  async getEmailSequences(userId: string, clientId?: string): Promise<EmailSequence[]> {
    try {
      let chain = this.supabase.from('email_sequences').select('*').eq('user_id', userId);

      if (clientId) {
        chain = chain.eq('client_id', clientId);
      }

      chain = chain.order('created_at', { ascending: false });

      const { data, error } = await chain;

      if (error) {
        throw new Error(`Failed to get email sequences: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get email sequences', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Get a specific email sequence
   */
  async getEmailSequence(sequenceId: string, userId: string): Promise<EmailSequence | null> {
    try {
      const { data: sequence, error } = await this.supabase
        .from('email_sequences')
        .select('*')
        .eq('id', sequenceId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get email sequence: ${error.message}`);
      }

      // Fetch steps separately to align with expected behavior
      const { data: steps, error: stepsError } = await this.supabase
        .from('email_steps')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('step_number');

      if (stepsError) {
        throw new Error(`Failed to get email steps: ${stepsError.message}`);
      }

      return { ...sequence, steps };
    } catch (error) {
      logger.error('Failed to get email sequence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sequenceId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete an email sequence
   */
  async deleteEmailSequence(sequenceId: string, userId: string): Promise<void> {
    try {
      // Delete steps first
      await this.supabase.from('email_steps').delete().eq('sequence_id', sequenceId);

      // Delete sequence
      const { error } = await this.supabase
        .from('email_sequences')
        .delete()
        .eq('id', sequenceId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete email sequence: ${error.message}`);
      }

      logBusinessEvent('email_sequence_deleted', {
        sequenceId,
        userId,
      });
    } catch (error) {
      logger.error('Failed to delete email sequence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sequenceId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Start an email sequence execution
   */
  async startEmailSequenceExecution(
    sequenceId: string,
    userId: string,
    clientId?: string,
    metadata: Record<string, any> = {},
  ): Promise<EmailSequenceExecution> {
    try {
      const executionId = uuidv4();
      const now = new Date().toISOString();

      // Get the sequence with steps
      const sequence = await this.getEmailSequence(sequenceId, userId);
      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      if (!sequence.isActive) {
        throw new Error('Email sequence is not active');
      }

      // Calculate next execution time (first step delay)
      const firstStep = sequence.steps.find(step => step.isActive);
      if (!firstStep) {
        throw new Error('No active steps found in sequence');
      }

      const nextExecutionAt = new Date();
      nextExecutionAt.setHours(nextExecutionAt.getHours() + firstStep.delayHours);

      const execution: EmailSequenceExecution = {
        id: executionId,
        sequenceId,
        userId,
        clientId,
        status: 'pending',
        currentStep: 0,
        nextExecutionAt: nextExecutionAt.toISOString(),
        metadata,
        createdAt: now,
        updatedAt: now,
      };

      const { data, error } = await this.supabase
        .from('email_sequence_executions')
        .insert([execution])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to start email sequence execution: ${error.message}`);
      }

      logBusinessEvent('email_sequence_execution_started', {
        executionId,
        sequenceId,
        userId,
        clientId,
        nextExecutionAt: execution.nextExecutionAt,
      });

      return data;
    } catch (error) {
      logger.error('Failed to start email sequence execution', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sequenceId,
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Execute the next step in an email sequence
   */
  async executeNextStep(executionId: string): Promise<EmailDelivery | null> {
    try {
      // Get execution
      const { data: execution, error: executionError } = await this.supabase
        .from('email_sequence_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (executionError) {
        throw new Error(`Failed to get execution: ${executionError.message}`);
      }

      if (execution.status !== 'pending' && execution.status !== 'active') {
        return null; // Execution is not active
      }

      // Get sequence and steps
      const sequence = await this.getEmailSequence(execution.sequenceId, execution.userId);
      if (!sequence) {
        throw new Error('Sequence not found');
      }

      const nextStep = sequence.steps.find(step => step.stepNumber === execution.currentStep + 1);
      if (!nextStep) {
        // No more steps, complete execution
        await this.completeExecution(executionId);
        return null;
      }

      // Get user email
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', execution.userId)
        .single();

      if (userError) {
        throw new Error(`Failed to get user: ${userError.message}`);
      }

      // Send email
      const delivery = await this.sendEmail(
        executionId,
        nextStep.id,
        execution.userId,
        user.email,
        nextStep.subject,
        nextStep.template,
        nextStep.variables,
        { ...execution.metadata, userName: user.full_name },
      );

      // Update execution
      const nextStepNumber = execution.currentStep + 1;
      const nextStepInSequence = sequence.steps.find(
        step => step.stepNumber === nextStepNumber + 1,
      );

      let nextExecutionAt: string | undefined;
      if (nextStepInSequence) {
        const nextExecution = new Date();
        nextExecution.setHours(nextExecution.getHours() + nextStepInSequence.delayHours);
        nextExecutionAt = nextExecution.toISOString();
      }

      const updateData: Partial<EmailSequenceExecution> = {
        status: nextStepInSequence ? 'active' : 'completed',
        currentStep: nextStepNumber,
        lastExecutedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (nextExecutionAt) {
        updateData.nextExecutionAt = nextExecutionAt;
      }

      if (!nextStepInSequence) {
        updateData.completedAt = new Date().toISOString();
      }

      await this.supabase
        .from('email_sequence_executions')
        .update(updateData)
        .eq('id', executionId);

      logBusinessEvent('email_sequence_step_executed', {
        executionId,
        stepId: nextStep.id,
        stepNumber: nextStepNumber,
        deliveryId: delivery.id,
      });

      return delivery;
    } catch (error) {
      logger.error('Failed to execute next step', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
      });
      throw error;
    }
  }

  /**
   * Send an email
   */
  private async sendEmail(
    executionId: string,
    stepId: string,
    userId: string,
    recipient: string,
    subject: string,
    template: string,
    variables: Record<string, any>,
    metadata: Record<string, any>,
  ): Promise<EmailDelivery> {
    try {
      const deliveryId = uuidv4();
      const now = new Date().toISOString();

      // Create delivery record
      const delivery: EmailDelivery = {
        id: deliveryId,
        executionId,
        stepId,
        userId,
        recipient,
        subject,
        status: 'pending',
        metadata,
        createdAt: now,
        updatedAt: now,
      };

      const { data: deliveryData, error: deliveryError } = await this.supabase
        .from('email_deliveries')
        .insert([delivery])
        .select()
        .single();

      if (deliveryError) {
        throw new Error(`Failed to create delivery record: ${deliveryError.message}`);
      }

      // Process template with variables
      let processedTemplate = template;
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
      }

      // Send email based on provider
      let sentAt: string | undefined;
      try {
        if (this.emailProvider.provider === 'sendgrid') {
          const msg = {
            to: recipient,
            from: {
              email: this.emailProvider.fromEmail,
              name: this.emailProvider.fromName,
            },
            subject,
            html: processedTemplate,
          };

          await sgMail.send(msg);
          sentAt = new Date().toISOString();
        } else {
          // For other providers, implement as needed
          throw new Error(`Email provider ${this.emailProvider.provider} not implemented`);
        }

        // Update delivery status
        await this.supabase
          .from('email_deliveries')
          .update({
            status: 'sent',
            sentAt,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', deliveryId);

        deliveryData.status = 'sent';
        deliveryData.sentAt = sentAt;

        logBusinessEvent('email_sent', {
          deliveryId,
          recipient,
          subject,
          provider: this.emailProvider.provider,
        });
      } catch (emailError) {
        // Update delivery status to failed
        await this.supabase
          .from('email_deliveries')
          .update({
            status: 'failed',
            errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
            updatedAt: new Date().toISOString(),
          })
          .eq('id', deliveryId);

        deliveryData.status = 'failed';
        deliveryData.errorMessage =
          emailError instanceof Error ? emailError.message : 'Unknown error';

        logger.error('Failed to send email', {
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          deliveryId,
          recipient,
          subject,
        });
      }

      return deliveryData;
    } catch (error) {
      logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
        stepId,
        recipient,
        subject,
      });
      throw error;
    }
  }

  /**
   * Complete an execution
   */
  private async completeExecution(executionId: string): Promise<void> {
    try {
      await this.supabase
        .from('email_sequence_executions')
        .update({
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', executionId);

      logBusinessEvent('email_sequence_execution_completed', {
        executionId,
      });
    } catch (error) {
      logger.error('Failed to complete execution', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
      });
      throw error;
    }
  }

  /**
   * Get executions for a user
   */
  async getExecutions(userId: string, clientId?: string): Promise<EmailSequenceExecution[]> {
    try {
      let chain = this.supabase.from('email_sequence_executions').select('*').eq('user_id', userId);

      if (clientId) {
        chain = chain.eq('client_id', clientId);
      }

      chain = chain.order('created_at', { ascending: false });

      const { data, error } = await chain;

      if (error) {
        throw new Error(`Failed to get executions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get executions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(
    userId: string,
    clientId?: string,
  ): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalFailed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }> {
    try {
      let chain = this.supabase.from('email_deliveries').select('status').eq('user_id', userId);

      if (clientId) {
        chain = chain.eq('client_id', clientId);
      }

      const { data, error } = await chain;

      if (error) {
        throw new Error(`Failed to get delivery stats: ${error.message}`);
      }

      const stats = {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalFailed: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      };

      data?.forEach((delivery: any) => {
        switch (delivery.status) {
          case 'sent':
            stats.totalSent++;
            break;
          case 'delivered':
            stats.totalDelivered++;
            break;
          case 'opened':
            stats.totalOpened++;
            break;
          case 'clicked':
            stats.totalClicked++;
            break;
          case 'bounced':
            stats.totalBounced++;
            break;
          case 'failed':
            stats.totalFailed++;
            break;
        }
      });

      const totalDelivered = stats.totalDelivered + stats.totalOpened + stats.totalClicked;
      const totalSent = stats.totalSent + totalDelivered + stats.totalBounced + stats.totalFailed;

      if (totalSent > 0) {
        stats.openRate = (stats.totalOpened / totalSent) * 100;
        stats.clickRate = (stats.totalClicked / totalSent) * 100;
        stats.bounceRate = (stats.totalBounced / totalSent) * 100;
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get delivery stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }
}
