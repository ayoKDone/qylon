import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  ConversionRecoveryCampaign,
  ConversionRecoveryExecution,
  CreateRecoveryCampaignRequest,
  IncentiveOffer,
  RecoveryMetrics,
  RecoveryResult,
  UpdateRecoveryCampaignRequest,
} from '../types';
import { logBusinessEvent, logger } from '../utils/logger';

export class ConversionRecoveryService {
  private supabase: any;
  private openai: OpenAI;

  constructor(supabaseUrl: string, supabaseKey: string, openaiApiKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  /**
   * Create a conversion recovery campaign
   */
  async createRecoveryCampaign(
    userId: string,
    request: CreateRecoveryCampaignRequest,
  ): Promise<ConversionRecoveryCampaign> {
    try {
      const campaignId = uuidv4();
      const now = new Date().toISOString();

      const campaign: ConversionRecoveryCampaign = {
        id: campaignId,
        name: request.name,
        description: request.description,
        targetSegment: request.targetSegment,
        recoveryStrategy: request.recoveryStrategy as any,
        isActive: true,
        userId,
        successMetrics: {
          targetConversionRate: 0,
          currentConversionRate: 0,
          totalRecovered: 0,
          totalAttempted: 0,
          averageRecoveryTime: 0,
          costPerRecovery: 0,
        },
        createdAt: now,
        updatedAt: now,
        ...(request.clientId && { clientId: request.clientId }),
      };

      const { data, error } = await this.supabase
        .from('conversion_recovery_campaigns')
        .insert([campaign])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create recovery campaign: ${error.message}`);
      }

      logBusinessEvent('recovery_campaign_created', {
        campaignId,
        userId,
        clientId: request.clientId,
        strategy: request.recoveryStrategy,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create recovery campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        request,
      });
      throw error;
    }
  }

  /**
   * Update a recovery campaign
   */
  async updateRecoveryCampaign(
    campaignId: string,
    userId: string,
    request: UpdateRecoveryCampaignRequest,
  ): Promise<ConversionRecoveryCampaign> {
    try {
      const updateData: Partial<ConversionRecoveryCampaign> = {
        updatedAt: new Date().toISOString(),
      };

      if (request.name !== undefined) updateData.name = request.name;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.targetSegment !== undefined) updateData.targetSegment = request.targetSegment;
      if (request.recoveryStrategy !== undefined)
        updateData.recoveryStrategy = request.recoveryStrategy as any;
      if (request.isActive !== undefined) updateData.isActive = request.isActive;

      const { data, error } = await this.supabase
        .from('conversion_recovery_campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update recovery campaign: ${error.message}`);
      }

      logBusinessEvent('recovery_campaign_updated', {
        campaignId,
        userId,
        updates: Object.keys(updateData),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update recovery campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId,
        userId,
        request,
      });
      throw error;
    }
  }

  /**
   * Get recovery campaigns for a user
   */
  async getRecoveryCampaigns(
    userId: string,
    clientId?: string,
  ): Promise<ConversionRecoveryCampaign[]> {
    try {
      let query = this.supabase
        .from('conversion_recovery_campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get recovery campaigns: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get recovery campaigns', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Get a specific recovery campaign
   */
  async getRecoveryCampaign(
    campaignId: string,
    userId: string,
  ): Promise<ConversionRecoveryCampaign | null> {
    try {
      const { data, error } = await this.supabase
        .from('conversion_recovery_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get recovery campaign: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Failed to get recovery campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete a recovery campaign
   */
  async deleteRecoveryCampaign(campaignId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversion_recovery_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete recovery campaign: ${error.message}`);
      }

      logBusinessEvent('recovery_campaign_deleted', {
        campaignId,
        userId,
      });
    } catch (error) {
      logger.error('Failed to delete recovery campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Execute a recovery campaign for a user
   */
  async executeRecoveryCampaign(
    campaignId: string,
    targetUserId: string,
    userId: string,
    clientId?: string,
  ): Promise<ConversionRecoveryExecution> {
    try {
      const campaign = await this.getRecoveryCampaign(campaignId, userId);
      if (!campaign) {
        throw new Error('Recovery campaign not found');
      }

      if (!campaign.isActive) {
        throw new Error('Recovery campaign is not active');
      }

      const executionId = uuidv4();
      const now = new Date().toISOString();

      // Generate personalized content based on strategy
      const personalizedContent = await this.generatePersonalizedContent(
        campaign,
        targetUserId,
        clientId,
      );

      // Generate incentive offer if applicable
      const incentiveOffer = await this.generateIncentiveOffer(campaign, targetUserId, clientId);

      const execution: ConversionRecoveryExecution = {
        id: executionId,
        campaignId,
        userId: targetUserId,
        status: 'pending',
        strategy: campaign.recoveryStrategy,
        startDate: now,
        createdAt: now,
        updatedAt: now,
        ...(personalizedContent && { personalizedContent }),
        ...(incentiveOffer && { incentiveOffer }),
        ...(clientId && { clientId }),
      };

      const { data, error } = await this.supabase
        .from('conversion_recovery_executions')
        .insert([execution])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create recovery execution: ${error.message}`);
      }

      // Execute the recovery strategy
      await this.executeRecoveryStrategy(execution);

      logBusinessEvent('recovery_campaign_executed', {
        executionId,
        campaignId,
        targetUserId,
        clientId,
        strategy: campaign.recoveryStrategy,
      });

      return data;
    } catch (error) {
      logger.error('Failed to execute recovery campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId,
        targetUserId,
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Generate personalized content for recovery
   */
  private async generatePersonalizedContent(
    campaign: ConversionRecoveryCampaign,
    targetUserId: string,
    clientId?: string,
  ): Promise<string> {
    try {
      // Get user behavior profile
      const { data: profile, error: profileError } = await this.supabase
        .from('user_behavior_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('client_id', clientId || null)
        .single();

      if (profileError) {
        logger.warn('Could not get user behavior profile for personalization', {
          targetUserId,
          clientId,
          error: profileError.message,
        });
      }

      // Get user information
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('full_name, company_name, industry')
        .eq('id', targetUserId)
        .single();

      if (userError) {
        logger.warn('Could not get user information for personalization', {
          targetUserId,
          error: userError.message,
        });
      }

      const prompt = `
        Generate personalized recovery content for a user who has shown signs of churning.

        Campaign Strategy: ${campaign.recoveryStrategy}
        Target Segment: ${campaign.targetSegment}

        User Information:
        - Name: ${user?.full_name || 'Valued Customer'}
        - Company: ${user?.company_name || 'Your Company'}
        - Industry: ${user?.industry || 'Business'}

        User Behavior Profile:
        - Engagement Score: ${profile?.engagement_score || 'Unknown'}
        - Last Activity: ${profile?.last_activity_at || 'Unknown'}
        - Risk Factors: ${profile?.risk_factors?.map((r: any) => r.factor).join(', ') || 'None identified'}

        Generate a personalized message that:
        1. Acknowledges their specific situation
        2. Addresses their pain points
        3. Offers relevant solutions
        4. Creates urgency without being pushy
        5. Maintains a professional but warm tone

        Keep the message concise (2-3 paragraphs) and actionable.
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a customer success specialist helping to re-engage users who are at risk of churning. Generate personalized, empathetic, and actionable recovery content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        'We value your business and would love to help you succeed.'
      );
    } catch (error) {
      logger.error('Failed to generate personalized content', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId: campaign.id,
        targetUserId,
        clientId,
      });
      return 'We value your business and would love to help you succeed.';
    }
  }

  /**
   * Generate incentive offer for recovery
   */
  private async generateIncentiveOffer(
    campaign: ConversionRecoveryCampaign,
    targetUserId: string,
    clientId?: string,
  ): Promise<IncentiveOffer | undefined> {
    try {
      // Only generate offers for certain strategies
      if (!['incentive_offer', 'personalized_outreach'].includes(campaign.recoveryStrategy)) {
        return undefined;
      }

      // Get user subscription information
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('subscription_plan_id')
        .eq('id', targetUserId)
        .single();

      if (userError) {
        logger.warn('Could not get user subscription for incentive offer', {
          targetUserId,
          error: userError.message,
        });
      }

      // Get subscription plan details
      let planDetails = null;
      if (user?.subscription_plan_id) {
        const { data: plan, error: planError } = await this.supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', user.subscription_plan_id)
          .single();

        if (!planError) {
          planDetails = plan;
        }
      }

      // Generate appropriate incentive based on user's situation
      const incentiveTypes = ['discount', 'free_trial', 'feature_upgrade', 'consultation'];
      const selectedType =
        incentiveTypes[Math.floor(Math.random() * incentiveTypes.length)] || 'discount';

      const incentive: IncentiveOffer = {
        type: selectedType as any,
        value: this.generateIncentiveValue(selectedType, planDetails || {}),
        description: this.generateIncentiveDescription(selectedType, planDetails || {}),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      return incentive;
    } catch (error) {
      logger.error('Failed to generate incentive offer', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId: campaign.id,
        targetUserId,
        clientId,
      });
      return undefined;
    }
  }

  /**
   * Generate incentive value based on type and plan
   */
  private generateIncentiveValue(type: string, _planDetails: any): string {
    switch (type) {
      case 'discount':
        return '20%';
      case 'free_trial':
        return '30 days';
      case 'feature_upgrade':
        return 'Premium Features';
      case 'consultation':
        return '1 hour';
      default:
        return 'Special Offer';
    }
  }

  /**
   * Generate incentive description
   */
  private generateIncentiveDescription(type: string, _planDetails: any): string {
    switch (type) {
      case 'discount':
        return '20% discount on your next billing cycle';
      case 'free_trial':
        return '30-day free trial of premium features';
      case 'feature_upgrade':
        return 'Free upgrade to premium features for 3 months';
      case 'consultation':
        return 'Free 1-hour consultation with our success team';
      default:
        return 'Special offer just for you';
    }
  }

  /**
   * Execute the recovery strategy
   */
  private async executeRecoveryStrategy(execution: ConversionRecoveryExecution): Promise<void> {
    try {
      // Update execution status to active
      await this.supabase
        .from('conversion_recovery_executions')
        .update({
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', execution.id);

      // Execute based on strategy
      switch (execution.strategy) {
        case 'email_sequence':
          await this.executeEmailSequenceStrategy(execution);
          break;
        case 'personalized_outreach':
          await this.executePersonalizedOutreachStrategy(execution);
          break;
        case 'incentive_offer':
          await this.executeIncentiveOfferStrategy(execution);
          break;
        case 'feature_highlight':
          await this.executeFeatureHighlightStrategy(execution);
          break;
        default:
          logger.warn('Unknown recovery strategy', {
            executionId: execution.id,
            strategy: execution.strategy,
          });
      }
    } catch (error) {
      logger.error('Failed to execute recovery strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: execution.id,
        strategy: execution.strategy,
      });
      throw error;
    }
  }

  /**
   * Execute email sequence strategy
   */
  private async executeEmailSequenceStrategy(
    execution: ConversionRecoveryExecution,
  ): Promise<void> {
    try {
      // Find an appropriate email sequence for recovery
      const { data: sequences, error: sequencesError } = await this.supabase
        .from('email_sequences')
        .select('*')
        .eq('trigger_event', 'recovery_campaign')
        .eq('is_active', true)
        .limit(1);

      if (sequencesError || !sequences || sequences.length === 0) {
        logger.warn('No recovery email sequences found', {
          executionId: execution.id,
          userId: execution.userId,
        });
        return;
      }

      const sequence = sequences[0];

      // Start the email sequence execution
      const { data: sequenceExecution, error: executionError } = await this.supabase
        .from('email_sequence_executions')
        .insert([
          {
            sequence_id: sequence.id,
            user_id: execution.userId,
            client_id: execution.clientId,
            status: 'pending',
            metadata: {
              recovery_execution_id: execution.id,
              personalized_content: execution.personalizedContent,
            },
          },
        ])
        .select()
        .single();

      if (executionError) {
        throw new Error(`Failed to start email sequence: ${executionError.message}`);
      }

      logger.info('Email sequence strategy executed', {
        executionId: execution.id,
        userId: execution.userId,
        sequenceId: sequence.id,
        sequenceExecutionId: sequenceExecution.id,
      });
    } catch (error) {
      logger.error('Failed to execute email sequence strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: execution.id,
        userId: execution.userId,
      });
      throw error;
    }
  }

  /**
   * Execute personalized outreach strategy
   */
  private async executePersonalizedOutreachStrategy(
    execution: ConversionRecoveryExecution,
  ): Promise<void> {
    try {
      // Get user information for personalized outreach
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('email, full_name, phone')
        .eq('id', execution.userId)
        .single();

      if (userError) {
        throw new Error(`Failed to get user information: ${userError.message}`);
      }

      // Create a notification record for the outreach
      const { data: notification, error: notificationError } = await this.supabase
        .from('notifications')
        .insert([
          {
            user_id: execution.userId,
            client_id: execution.clientId,
            type: 'recovery_outreach',
            title: "We miss you! Let's get you back on track",
            message:
              execution.personalizedContent ||
              "We noticed you haven't been active lately. We'd love to help you get back on track.",
            priority: 'high',
            metadata: {
              recovery_execution_id: execution.id,
              strategy: 'personalized_outreach',
              incentive_offer: execution.incentiveOffer,
            },
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (notificationError) {
        logger.warn('Failed to create notification, falling back to email', {
          executionId: execution.id,
          userId: execution.userId,
          error: notificationError.message,
        });

        // Fallback: Send email directly
        await this.sendRecoveryEmail(
          user.email,
          execution.personalizedContent || '',
          execution.incentiveOffer,
        );
      }

      logger.info('Personalized outreach strategy executed', {
        executionId: execution.id,
        userId: execution.userId,
        notificationId: notification?.id,
        content: execution.personalizedContent,
      });
    } catch (error) {
      logger.error('Failed to execute personalized outreach strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: execution.id,
        userId: execution.userId,
      });
      throw error;
    }
  }

  /**
   * Execute incentive offer strategy
   */
  private async executeIncentiveOfferStrategy(
    execution: ConversionRecoveryExecution,
  ): Promise<void> {
    try {
      // Get user information
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', execution.userId)
        .single();

      if (userError) {
        throw new Error(`Failed to get user information: ${userError.message}`);
      }

      // Send incentive offer email
      await this.sendRecoveryEmail(
        user.email,
        execution.personalizedContent || 'We have a special offer just for you!',
        execution.incentiveOffer,
      );

      // Create incentive record in database
      const { error: incentiveError } = await this.supabase.from('incentive_offers').insert([
        {
          user_id: execution.userId,
          client_id: execution.clientId,
          recovery_execution_id: execution.id,
          type: execution.incentiveOffer?.type || 'discount',
          value: execution.incentiveOffer?.value || '10%',
          description: execution.incentiveOffer?.description || 'Special recovery offer',
          expiration_date: execution.incentiveOffer?.expirationDate,
          status: 'sent',
        },
      ]);

      if (incentiveError) {
        logger.warn('Failed to create incentive offer record', {
          executionId: execution.id,
          userId: execution.userId,
          error: incentiveError.message,
        });
      }

      logger.info('Incentive offer strategy executed', {
        executionId: execution.id,
        userId: execution.userId,
        offer: execution.incentiveOffer,
      });
    } catch (error) {
      logger.error('Failed to execute incentive offer strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: execution.id,
        userId: execution.userId,
      });
      throw error;
    }
  }

  /**
   * Execute feature highlight strategy
   */
  private async executeFeatureHighlightStrategy(
    execution: ConversionRecoveryExecution,
  ): Promise<void> {
    try {
      // Get user information
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', execution.userId)
        .single();

      if (userError) {
        throw new Error(`Failed to get user information: ${userError.message}`);
      }

      // Use user data for logging or future functionality
      if (user) {
        logger.info('Feature highlight strategy executed for user', {
          userId: execution.userId,
          userEmail: user.email,
          userName: user.full_name,
        });
      }

      // Create feature highlight notification
      const { data: notification, error: notificationError } = await this.supabase
        .from('notifications')
        .insert([
          {
            user_id: execution.userId,
            client_id: execution.clientId,
            type: 'feature_highlight',
            title: 'Discover features you might have missed!',
            message:
              execution.personalizedContent ||
              "We've added some amazing new features that could help you get more value from Qylon.",
            priority: 'medium',
            metadata: {
              recovery_execution_id: execution.id,
              strategy: 'feature_highlight',
              action_url: '/features',
            },
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (notificationError) {
        logger.warn('Failed to create feature highlight notification', {
          executionId: execution.id,
          userId: execution.userId,
          error: notificationError.message,
        });
      }

      logger.info('Feature highlight strategy executed', {
        executionId: execution.id,
        userId: execution.userId,
        notificationId: notification?.id,
      });
    } catch (error) {
      logger.error('Failed to execute feature highlight strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: execution.id,
        userId: execution.userId,
      });
      throw error;
    }
  }

  /**
   * Send recovery email
   */
  private async sendRecoveryEmail(
    email: string,
    content: string,
    incentiveOffer?: IncentiveOffer,
  ): Promise<void> {
    try {
      // This would integrate with the email service
      // For now, we'll just log the action
      logger.info('Sending recovery email', {
        email,
        content: content.substring(0, 100) + '...',
        hasIncentive: !!incentiveOffer,
        incentiveType: incentiveOffer?.type,
      });

      // TODO: Integrate with actual email service (SendGrid, etc.)
      // await emailService.sendRecoveryEmail(email, content, incentiveOffer);
    } catch (error) {
      logger.error('Failed to send recovery email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw error;
    }
  }

  /**
   * Complete a recovery execution
   */
  async completeRecoveryExecution(executionId: string, result: RecoveryResult): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversion_recovery_executions')
        .update({
          status: 'completed',
          result,
          endDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', executionId);

      if (error) {
        throw new Error(`Failed to complete recovery execution: ${error.message}`);
      }

      // Update campaign metrics
      await this.updateCampaignMetrics(executionId, result);

      logBusinessEvent('recovery_execution_completed', {
        executionId,
        result: result.outcome,
        conversionValue: result.conversionValue,
      });
    } catch (error) {
      logger.error('Failed to complete recovery execution', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
        result,
      });
      throw error;
    }
  }

  /**
   * Update campaign metrics based on execution result
   */
  private async updateCampaignMetrics(executionId: string, result: RecoveryResult): Promise<void> {
    try {
      // Get execution to find campaign
      const { data: execution, error: executionError } = await this.supabase
        .from('conversion_recovery_executions')
        .select('campaign_id')
        .eq('id', executionId)
        .single();

      if (executionError) {
        throw new Error(`Failed to get execution: ${executionError.message}`);
      }

      // Update campaign metrics
      const updateData: Partial<RecoveryMetrics> = {};

      if (result.outcome === 'converted') {
        updateData.totalRecovered = this.supabase.raw('total_recovered + 1');
      }

      updateData.totalAttempted = this.supabase.raw('total_attempted + 1');

      // Calculate new conversion rate
      updateData.currentConversionRate = this.supabase.raw(`
        (total_recovered::float / total_attempted::float) * 100
      `);

      await this.supabase
        .from('conversion_recovery_campaigns')
        .update({
          success_metrics: updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', execution.campaign_id);
    } catch (error) {
      logger.error('Failed to update campaign metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
        result,
      });
      throw error;
    }
  }

  /**
   * Get recovery executions for a campaign
   */
  async getRecoveryExecutions(
    campaignId: string,
    userId: string,
  ): Promise<ConversionRecoveryExecution[]> {
    try {
      const { data, error } = await this.supabase
        .from('conversion_recovery_executions')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get recovery executions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get recovery executions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        campaignId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get recovery analytics
   */
  async getRecoveryAnalytics(
    userId: string,
    clientId?: string,
  ): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalRecovered: number;
    averageRecoveryRate: number;
    averageRecoveryTime: number;
    costPerRecovery: number;
  }> {
    try {
      let query = this.supabase
        .from('conversion_recovery_campaigns')
        .select('*')
        .eq('user_id', userId);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: campaigns, error } = await query;

      if (error) {
        throw new Error(`Failed to get recovery analytics: ${error.message}`);
      }

      const analytics = {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: 0,
        totalRecovered: 0,
        averageRecoveryRate: 0,
        averageRecoveryTime: 0,
        costPerRecovery: 0,
      };

      if (!campaigns || campaigns.length === 0) {
        return analytics;
      }

      let totalAttempted = 0;
      let totalRecoveryTime = 0;
      let totalCost = 0;

      campaigns.forEach((campaign: ConversionRecoveryCampaign) => {
        if (campaign.isActive) {
          analytics.activeCampaigns++;
        }

        analytics.totalRecovered += campaign.successMetrics.totalRecovered;
        totalAttempted += campaign.successMetrics.totalAttempted;
        totalRecoveryTime += campaign.successMetrics.averageRecoveryTime;
        totalCost += campaign.successMetrics.costPerRecovery;
      });

      if (totalAttempted > 0) {
        analytics.averageRecoveryRate = (analytics.totalRecovered / totalAttempted) * 100;
      }

      if (campaigns.length > 0) {
        analytics.averageRecoveryTime = totalRecoveryTime / campaigns.length;
        analytics.costPerRecovery = totalCost / campaigns.length;
      }

      return analytics;
    } catch (error) {
      logger.error('Failed to get recovery analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }
}
