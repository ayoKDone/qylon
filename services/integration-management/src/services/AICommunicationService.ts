import OpenAI from 'openai';
import {
  AIResponse,
  CommunicationMessage,
  IntegrationConfig,
  IntegrationType,
  SentimentAnalysis,
} from '../types';
import { logIntegrationEvent } from '../utils/logger';

interface ChatContext {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  userId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AICommunicationService {
  private openai: OpenAI;
  private config: IntegrationConfig;
  private chatContexts: Map<string, ChatContext> = new Map();
  private responseTemplates: Map<string, ResponseTemplate> = new Map();

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of the following text and respond with a JSON object containing:
            - score: number between -1 (very negative) and 1 (very positive)
            - magnitude: number between 0 and 1 indicating the strength of the sentiment
            - sentiment: one of "positive", "negative", or "neutral"
            - confidence: number between 0 and 1 indicating confidence in the analysis

            Example response: {"score": 0.8, "magnitude": 0.9, "sentiment": "positive", "confidence": 0.95}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.1,
        max_tokens: 150,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No sentiment analysis response received');
      }

      const analysis = JSON.parse(analysisText) as SentimentAnalysis;

      await this.logOperation('sentiment_analyzed', {
        textLength: text.length,
        sentiment: analysis.sentiment,
        score: analysis.score,
        confidence: analysis.confidence,
      });

      return analysis;
    } catch (error) {
      await this.logOperation('sentiment_analysis_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        textLength: text.length,
      });

      // Return neutral sentiment as fallback
      return {
        score: 0,
        magnitude: 0,
        sentiment: 'neutral',
        confidence: 0,
      };
    }
  }

  async generateResponse(
    userMessage: string,
    context: {
      userId: string;
      sessionId: string;
      platform: string;
      channel?: string;
      previousMessages?: CommunicationMessage[];
    },
  ): Promise<AIResponse> {
    try {
      const sessionKey = `${context.userId}_${context.sessionId}`;
      let chatContext = this.chatContexts.get(sessionKey);

      if (!chatContext) {
        chatContext = {
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(context.platform),
              timestamp: new Date().toISOString(),
            },
          ],
          userId: context.userId,
          sessionId: context.sessionId,
          metadata: {
            platform: context.platform,
            channel: context.channel,
          },
        };
        this.chatContexts.set(sessionKey, chatContext);
      }

      // Add user message to context
      chatContext.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      // Analyze sentiment of user message
      const sentiment = await this.analyzeSentiment(userMessage);

      // Generate response based on sentiment and context
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: chatContext.messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiContent = response.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error('No AI response generated');
      }

      // Add AI response to context
      chatContext.messages.push({
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      });

      // Limit context size to prevent token overflow
      if (chatContext.messages.length > 20) {
        chatContext.messages = [
          chatContext.messages[0]!, // Keep system message
          ...chatContext.messages.slice(-19), // Keep last 19 messages
        ];
      }

      const aiResponse: AIResponse = {
        content: aiContent,
        sentiment: sentiment,
        confidence: this.calculateResponseConfidence(aiContent, sentiment),
        suggestedActions: this.generateSuggestedActions(sentiment, context.platform),
        metadata: {
          model: 'gpt-4',
          tokens: response.usage?.total_tokens,
          sessionId: context.sessionId,
          platform: context.platform,
        },
      };

      await this.logOperation('response_generated', {
        userId: context.userId,
        sessionId: context.sessionId,
        platform: context.platform,
        sentiment: sentiment.sentiment,
        confidence: aiResponse.confidence,
        contentLength: aiContent.length,
      });

      return aiResponse;
    } catch (error) {
      await this.logOperation('response_generation_failed', {
        userId: context.userId,
        sessionId: context.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async generatePersonalizedResponse(
    templateId: string,
    variables: Record<string, string>,
    userContext: {
      userId: string;
      preferences?: Record<string, any>;
      history?: CommunicationMessage[];
    },
  ): Promise<string> {
    try {
      const template = this.responseTemplates.get(templateId);
      if (!template || !template.isActive) {
        throw new Error('Template not found or inactive');
      }

      let content = template.content;

      // Replace variables in template
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      // Personalize based on user context
      if (userContext.preferences) {
        content = await this.personalizeContent(content, userContext.preferences);
      }

      await this.logOperation('personalized_response_generated', {
        templateId,
        userId: userContext.userId,
        variablesCount: Object.keys(variables).length,
        contentLength: content.length,
      });

      return content;
    } catch (error) {
      await this.logOperation('personalized_response_failed', {
        templateId,
        userId: userContext.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async optimizeResponse(
    originalResponse: string,
    targetSentiment: 'positive' | 'negative' | 'neutral',
    context: {
      platform: string;
      channel?: string;
      audience?: string;
    },
  ): Promise<string> {
    try {
      const currentSentiment = await this.analyzeSentiment(originalResponse);

      if (currentSentiment.sentiment === targetSentiment) {
        return originalResponse;
      }

      const optimizationPrompt = `Optimize the following response to have a ${targetSentiment} sentiment while maintaining its core message and appropriateness for ${context.platform} platform:

Original response: "${originalResponse}"

Requirements:
- Maintain the original meaning and intent
- Adjust tone to be ${targetSentiment}
- Keep it appropriate for ${context.platform}
- Make it natural and conversational
- Length should be similar to original

Optimized response:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: optimizationPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const optimizedContent = response.choices[0]?.message?.content;
      if (!optimizedContent) {
        throw new Error('No optimized response generated');
      }

      await this.logOperation('response_optimized', {
        originalSentiment: currentSentiment.sentiment,
        targetSentiment,
        platform: context.platform,
        originalLength: originalResponse.length,
        optimizedLength: optimizedContent.length,
      });

      return optimizedContent;
    } catch (error) {
      await this.logOperation('response_optimization_failed', {
        targetSentiment,
        platform: context.platform,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return originalResponse; // Return original if optimization fails
    }
  }

  async createResponseTemplate(
    name: string,
    category: string,
    content: string,
    variables: string[],
    sentiment?: 'positive' | 'negative' | 'neutral',
  ): Promise<ResponseTemplate> {
    try {
      const template: ResponseTemplate = {
        id: this.generateTemplateId(),
        name,
        category,
        content,
        variables,
        sentiment: sentiment || 'neutral',
        confidence: sentiment ? 0.8 : 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.responseTemplates.set(template.id, template);

      await this.logOperation('response_template_created', {
        templateId: template.id,
        name,
        category,
        variablesCount: variables.length,
        hasSentiment: !!sentiment,
      });

      return template;
    } catch (error) {
      await this.logOperation('response_template_creation_failed', {
        name,
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateResponseTemplate(
    templateId: string,
    updates: Partial<ResponseTemplate>,
  ): Promise<ResponseTemplate> {
    try {
      const template = this.responseTemplates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.responseTemplates.set(templateId, updatedTemplate);

      await this.logOperation('response_template_updated', {
        templateId,
        updatedFields: Object.keys(updates),
      });

      return updatedTemplate;
    } catch (error) {
      await this.logOperation('response_template_update_failed', {
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getResponseTemplates(category?: string): Promise<ResponseTemplate[]> {
    const templates = Array.from(this.responseTemplates.values());

    if (category) {
      return templates.filter(template => template.category === category);
    }

    return templates;
  }

  async clearChatContext(userId: string, sessionId: string): Promise<void> {
    const sessionKey = `${userId}_${sessionId}`;
    this.chatContexts.delete(sessionKey);

    await this.logOperation('chat_context_cleared', {
      userId,
      sessionId,
    });
  }

  async getChatContext(userId: string, sessionId: string): Promise<ChatContext | null> {
    const sessionKey = `${userId}_${sessionId}`;
    return this.chatContexts.get(sessionKey) || null;
  }

  private getSystemPrompt(platform: string): string {
    const basePrompt = `You are Qylon AI, an intelligent assistant for the Qylon AI automation platform. You help users with business process automation, CRM integrations, and communication management.

Your role:
- Provide helpful, accurate, and professional responses
- Be concise but thorough
- Adapt your communication style to the platform (${platform})
- Focus on business automation and productivity
- Be empathetic and understanding
- Ask clarifying questions when needed

Guidelines:
- Always maintain a professional tone
- Provide actionable advice
- Be specific about Qylon features and capabilities
- If you don't know something, say so and offer to help find the information
- Keep responses focused and relevant`;

    switch (platform.toLowerCase()) {
      case 'slack':
        return (
          basePrompt +
          '\n\nSlack-specific: Use emojis sparingly, keep messages concise, use threads for longer conversations.'
        );
      case 'discord':
        return (
          basePrompt +
          '\n\nDiscord-specific: Be friendly and engaging, use appropriate formatting, consider the gaming/community context.'
        );
      case 'teams':
        return (
          basePrompt +
          '\n\nTeams-specific: Maintain corporate professionalism, focus on business value, use formal language.'
        );
      default:
        return basePrompt;
    }
  }

  private calculateResponseConfidence(content: string, sentiment: SentimentAnalysis): number {
    // Base confidence on sentiment analysis confidence and content quality
    let confidence = sentiment.confidence;

    // Adjust based on content length (too short or too long reduces confidence)
    const length = content.length;
    if (length < 10) confidence *= 0.5;
    else if (length > 500) confidence *= 0.8;

    // Adjust based on content quality indicators
    if (content.includes("I don't know") || content.includes("I'm not sure")) {
      confidence *= 0.7;
    }

    return Math.min(confidence, 1.0);
  }

  private generateSuggestedActions(sentiment: SentimentAnalysis, platform: string): string[] {
    const actions: string[] = [];

    if (sentiment.sentiment === 'negative') {
      actions.push('escalate_to_human_support');
      actions.push('offer_alternative_solutions');
    } else if (sentiment.sentiment === 'positive') {
      actions.push('suggest_advanced_features');
      actions.push('request_feedback');
    }

    // Platform-specific actions
    switch (platform.toLowerCase()) {
      case 'slack':
        actions.push('create_slack_channel');
        break;
      case 'discord':
        actions.push('create_discord_server');
        break;
      case 'teams':
        actions.push('schedule_teams_meeting');
        break;
    }

    return actions;
  }

  private async personalizeContent(
    content: string,
    preferences: Record<string, any>,
  ): Promise<string> {
    // Simple personalization based on preferences
    // In a real implementation, this would use AI to personalize content
    let personalizedContent = content;

    if (preferences['communicationStyle'] === 'formal') {
      personalizedContent = personalizedContent.replace(/hey|hi/g, 'Hello');
    } else if (preferences['communicationStyle'] === 'casual') {
      personalizedContent = personalizedContent.replace(/Hello|Good morning/g, 'Hey');
    }

    return personalizedContent;
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logOperation(operation: string, data: Record<string, any> = {}): Promise<void> {
    logIntegrationEvent(
      operation,
      IntegrationType.COMMUNICATION_SLACK, // Using a generic type for AI service
      this.config.userId,
      data,
    );
  }
}
