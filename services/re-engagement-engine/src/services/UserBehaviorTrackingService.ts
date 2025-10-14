import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorPattern, RiskFactor, UserBehaviorEvent, UserBehaviorProfile } from '../types';
import { logBusinessEvent, logger } from '../utils/logger';

export class UserBehaviorTrackingService {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Track a user behavior event
   */
  async trackEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    clientId?: string,
  ): Promise<UserBehaviorEvent> {
    try {
      const eventId = uuidv4();
      const now = new Date().toISOString();

      const event: UserBehaviorEvent = {
        id: eventId,
        userId,
        eventType,
        eventData,
        timestamp: now,
        metadata: {
          source: 're-engagement-engine',
          version: '1.0.0',
        },
        ...(clientId && { clientId }),
        ...(sessionId && { sessionId }),
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
      };

      const { data, error } = await this.supabase
        .from('user_behavior_events')
        .insert([event])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to track event: ${error.message}`);
      }

      // Update user behavior profile
      await this.updateBehaviorProfile(userId, clientId, eventType, eventData);

      logBusinessEvent('user_behavior_event_tracked', {
        eventId,
        userId,
        clientId,
        eventType,
        sessionId,
      });

      return data;
    } catch (error) {
      logger.error('Failed to track user behavior event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        eventType,
        eventData,
      });
      throw error;
    }
  }

  /**
   * Update user behavior profile based on new event
   */
  private async updateBehaviorProfile(
    userId: string,
    clientId: string | undefined,
    eventType: string,
    eventData: Record<string, any>,
  ): Promise<void> {
    try {
      // Get existing profile or create new one
      const { data: existingProfile, error: profileError } = await this.supabase
        .from('user_behavior_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId || null)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Failed to get behavior profile: ${profileError.message}`);
      }

      const now = new Date().toISOString();
      let profile = existingProfile;

      if (!profile) {
        // Create new profile
        const newProfile: UserBehaviorProfile = {
          id: uuidv4(),
          userId,
          engagementScore: 0,
          lastActivityAt: now,
          totalSessions: 0,
          averageSessionDuration: 0,
          preferredChannels: [],
          behaviorPatterns: [],
          riskFactors: [],
          createdAt: now,
          updatedAt: now,
          ...(clientId && { clientId }),
        };

        const { data: createdProfile, error: createError } = await this.supabase
          .from('user_behavior_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create behavior profile: ${createError.message}`);
        }

        profile = createdProfile;
      }

      // Update profile based on event
      const updatedProfile = await this.calculateUpdatedProfile(profile, eventType, eventData);

      const { error: updateError } = await this.supabase
        .from('user_behavior_profiles')
        .update({
          ...updatedProfile,
          updatedAt: now,
        })
        .eq('id', profile.id);

      if (updateError) {
        throw new Error(`Failed to update behavior profile: ${updateError.message}`);
      }
    } catch (error) {
      logger.error('Failed to update behavior profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
        eventType,
      });
      throw error;
    }
  }

  /**
   * Calculate updated profile based on new event
   */
  private async calculateUpdatedProfile(
    profile: UserBehaviorProfile,
    eventType: string,
    eventData: Record<string, any>,
  ): Promise<Partial<UserBehaviorProfile>> {
    const now = new Date().toISOString();
    const updates: Partial<UserBehaviorProfile> = {
      lastActivityAt: now,
    };

    // Update engagement score based on event type
    let engagementDelta = 0;
    switch (eventType) {
      case 'login':
        engagementDelta = 10;
        break;
      case 'meeting_created':
        engagementDelta = 20;
        break;
      case 'workflow_executed':
        engagementDelta = 15;
        break;
      case 'content_generated':
        engagementDelta = 25;
        break;
      case 'integration_connected':
        engagementDelta = 30;
        break;
      case 'email_opened':
        engagementDelta = 5;
        break;
      case 'email_clicked':
        engagementDelta = 10;
        break;
      case 'page_view':
        engagementDelta = 2;
        break;
      case 'feature_used':
        engagementDelta = 8;
        break;
      case 'support_contacted':
        engagementDelta = -5; // Negative for support
        break;
      case 'subscription_cancelled':
        engagementDelta = -50;
        break;
      case 'account_deleted':
        engagementDelta = -100;
        break;
      default:
        engagementDelta = 1;
    }

    // Apply engagement decay (reduce score over time)
    const lastActivity = new Date(profile.lastActivityAt);
    const daysSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.max(0, 1 - daysSinceLastActivity * 0.1); // 10% decay per day

    updates.engagementScore = Math.max(
      0,
      Math.min(100, profile.engagementScore * decayFactor + engagementDelta),
    );

    // Update session information
    if (eventType === 'session_start') {
      updates.totalSessions = profile.totalSessions + 1;
    }

    if (eventType === 'session_end' && eventData['duration']) {
      const totalDuration =
        profile.averageSessionDuration * profile.totalSessions + eventData['duration'];
      updates.averageSessionDuration = totalDuration / (profile.totalSessions + 1);
    }

    // Update preferred channels
    if (eventData['channel'] && !profile.preferredChannels.includes(eventData['channel'])) {
      updates.preferredChannels = [...profile.preferredChannels, eventData['channel']];
    }

    // Update behavior patterns
    const newPatterns = await this.analyzeBehaviorPatterns(profile, eventType, eventData);
    if (newPatterns.length > 0) {
      updates.behaviorPatterns = [...profile.behaviorPatterns, ...newPatterns];
    }

    // Update risk factors
    const newRiskFactors = await this.analyzeRiskFactors(profile, eventType, eventData);
    if (newRiskFactors.length > 0) {
      updates.riskFactors = [...profile.riskFactors, ...newRiskFactors];
    }

    return updates;
  }

  /**
   * Analyze behavior patterns
   */
  private async analyzeBehaviorPatterns(
    profile: UserBehaviorProfile,
    eventType: string,
    eventData: Record<string, any>,
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];
    const now = new Date().toISOString();

    // Pattern: Frequent login times
    if (eventType === 'login' && eventData['time']) {
      const hour = new Date(eventData['time']).getHours();
      const timePattern = `login_hour_${hour}`;

      const existingPattern = profile.behaviorPatterns.find(p => p.pattern === timePattern);
      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastOccurrence = now;
        existingPattern.confidence = Math.min(100, existingPattern.confidence + 5);
      } else {
        patterns.push({
          pattern: timePattern,
          frequency: 1,
          lastOccurrence: now,
          confidence: 10,
        });
      }
    }

    // Pattern: Feature usage frequency
    if (eventType === 'feature_used' && eventData['feature']) {
      const featurePattern = `feature_${eventData['feature']}`;

      const existingPattern = profile.behaviorPatterns.find(p => p.pattern === featurePattern);
      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastOccurrence = now;
        existingPattern.confidence = Math.min(100, existingPattern.confidence + 3);
      } else {
        patterns.push({
          pattern: featurePattern,
          frequency: 1,
          lastOccurrence: now,
          confidence: 5,
        });
      }
    }

    // Pattern: Device usage
    if (eventData['device']) {
      const devicePattern = `device_${eventData['device']}`;

      const existingPattern = profile.behaviorPatterns.find(p => p.pattern === devicePattern);
      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastOccurrence = now;
        existingPattern.confidence = Math.min(100, existingPattern.confidence + 2);
      } else {
        patterns.push({
          pattern: devicePattern,
          frequency: 1,
          lastOccurrence: now,
          confidence: 5,
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze risk factors
   */
  private async analyzeRiskFactors(
    profile: UserBehaviorProfile,
    eventType: string,
    eventData: Record<string, any>,
  ): Promise<RiskFactor[]> {
    const riskFactors: RiskFactor[] = [];
    const now = new Date().toISOString();

    // Risk: Low engagement score
    if (profile.engagementScore < 20) {
      const existingRisk = profile.riskFactors.find(r => r.factor === 'low_engagement');
      if (!existingRisk) {
        riskFactors.push({
          factor: 'low_engagement',
          severity: 'high',
          description: 'User has very low engagement score',
          detectedAt: now,
        });
      }
    }

    // Risk: No activity for extended period
    const lastActivity = new Date(profile.lastActivityAt);
    const daysSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastActivity > 30) {
      const existingRisk = profile.riskFactors.find(r => r.factor === 'inactive_user');
      if (!existingRisk) {
        riskFactors.push({
          factor: 'inactive_user',
          severity: 'medium',
          description: 'User has been inactive for more than 30 days',
          detectedAt: now,
        });
      }
    }

    // Risk: Support contact
    if (eventType === 'support_contacted') {
      const existingRisk = profile.riskFactors.find(r => r.factor === 'support_contact');
      if (!existingRisk) {
        riskFactors.push({
          factor: 'support_contact',
          severity: 'medium',
          description: 'User contacted support',
          detectedAt: now,
        });
      }
    }

    // Risk: Subscription issues
    if (eventType === 'subscription_payment_failed') {
      const existingRisk = profile.riskFactors.find(r => r.factor === 'payment_issues');
      if (!existingRisk) {
        riskFactors.push({
          factor: 'payment_issues',
          severity: 'high',
          description: 'User has payment issues',
          detectedAt: now,
        });
      }
    }

    // Risk: Feature abandonment
    if (eventType === 'feature_abandoned' && eventData['feature']) {
      const existingRisk = profile.riskFactors.find(
        r => r.factor === `abandoned_${eventData['feature']}`,
      );
      if (!existingRisk) {
        riskFactors.push({
          factor: `abandoned_${eventData['feature']}`,
          severity: 'medium',
          description: `User abandoned ${eventData['feature']} feature`,
          detectedAt: now,
        });
      }
    }

    return riskFactors;
  }

  /**
   * Get user behavior profile
   */
  async getBehaviorProfile(userId: string, clientId?: string): Promise<UserBehaviorProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_behavior_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId || null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get behavior profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Failed to get behavior profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
      });
      throw error;
    }
  }

  /**
   * Get behavior events for a user
   */
  async getBehaviorEvents(
    userId: string,
    clientId?: string,
    eventType?: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<UserBehaviorEvent[]> {
    try {
      let query = this.supabase
        .from('user_behavior_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get behavior events: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get behavior events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
        eventType,
      });
      throw error;
    }
  }

  /**
   * Get users at risk of churning
   */
  async getAtRiskUsers(
    clientId?: string,
    minRiskScore: number = 50,
    limit: number = 100,
  ): Promise<UserBehaviorProfile[]> {
    try {
      let query = this.supabase
        .from('user_behavior_profiles')
        .select('*')
        .lt('engagement_score', minRiskScore)
        .order('engagement_score', { ascending: true })
        .limit(limit);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get at-risk users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get at-risk users', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientId,
        minRiskScore,
      });
      throw error;
    }
  }

  /**
   * Get behavior analytics
   */
  async getBehaviorAnalytics(
    userId?: string,
    clientId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    averageEngagementScore: number;
    topRiskFactors: Array<{ factor: string; count: number }>;
    behaviorPatterns: Array<{ pattern: string; frequency: number }>;
    engagementDistribution: Array<{ range: string; count: number }>;
  }> {
    try {
      let query = this.supabase.from('user_behavior_profiles').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: profiles, error } = await query;

      if (error) {
        throw new Error(`Failed to get behavior analytics: ${error.message}`);
      }

      const analytics = {
        totalUsers: profiles?.length || 0,
        activeUsers: 0,
        averageEngagementScore: 0,
        topRiskFactors: [] as Array<{ factor: string; count: number }>,
        behaviorPatterns: [] as Array<{ pattern: string; frequency: number }>,
        engagementDistribution: [
          { range: '0-20', count: 0 },
          { range: '21-40', count: 0 },
          { range: '41-60', count: 0 },
          { range: '61-80', count: 0 },
          { range: '81-100', count: 0 },
        ],
      };

      if (!profiles || profiles.length === 0) {
        return analytics;
      }

      let totalEngagement = 0;
      const riskFactorCounts: Record<string, number> = {};
      const patternCounts: Record<string, number> = {};

      profiles.forEach((profile: UserBehaviorProfile) => {
        // Count active users (engagement score > 30)
        if (profile.engagementScore > 30) {
          analytics.activeUsers++;
        }

        // Calculate average engagement
        totalEngagement += profile.engagementScore;

        // Engagement distribution
        if (profile.engagementScore <= 20) {
          analytics.engagementDistribution[0]!.count++;
        } else if (profile.engagementScore <= 40) {
          analytics.engagementDistribution[1]!.count++;
        } else if (profile.engagementScore <= 60) {
          analytics.engagementDistribution[2]!.count++;
        } else if (profile.engagementScore <= 80) {
          analytics.engagementDistribution[3]!.count++;
        } else {
          analytics.engagementDistribution[4]!.count++;
        }

        // Count risk factors
        profile.riskFactors.forEach(risk => {
          riskFactorCounts[risk.factor] = (riskFactorCounts[risk.factor] || 0) + 1;
        });

        // Count behavior patterns
        profile.behaviorPatterns.forEach(pattern => {
          patternCounts[pattern.pattern] =
            (patternCounts[pattern.pattern] || 0) + pattern.frequency;
        });
      });

      analytics.averageEngagementScore = totalEngagement / profiles.length;

      // Sort and limit top risk factors
      analytics.topRiskFactors = Object.entries(riskFactorCounts)
        .map(([factor, count]) => ({ factor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Sort and limit behavior patterns
      analytics.behaviorPatterns = Object.entries(patternCounts)
        .map(([pattern, frequency]) => ({ pattern, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      return analytics;
    } catch (error) {
      logger.error('Failed to get behavior analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
        startDate,
        endDate,
      });
      throw error;
    }
  }

  /**
   * Resolve a risk factor
   */
  async resolveRiskFactor(userId: string, factor: string, clientId?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_behavior_profiles')
        .update({
          risk_factors: this.supabase.raw(`
            jsonb_set(
              risk_factors,
              '{${factor},resolved_at}',
              '"${new Date().toISOString()}"'
            )
          `),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('client_id', clientId || null);

      if (error) {
        throw new Error(`Failed to resolve risk factor: ${error.message}`);
      }

      logBusinessEvent('risk_factor_resolved', {
        userId,
        clientId,
        factor,
      });
    } catch (error) {
      logger.error('Failed to resolve risk factor', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        clientId,
        factor,
      });
      throw error;
    }
  }
}
