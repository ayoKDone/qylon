import OpenAI from 'openai';
import { MeetingTranscription, TranscriptionError } from '../types';
import { logger } from '../utils/logger';

export interface KeyTakeaway {
  id: string;
  meeting_id: string;
  category: TakeawayCategory;
  title: string;
  description: string;
  importance: ImportanceLevel;
  business_impact: BusinessImpactLevel;
  stakeholders_affected: string[];
  financial_implications?: string;
  timeline_impact?: string;
  risk_level: RiskLevel;
  follow_up_required: boolean;
  decision_made: boolean;
  strategic_insight: boolean;
  market_implications?: string;
  competitive_analysis?: string;
  customer_impact?: string;
  operational_changes?: string;
  created_at: Date;
  updated_at: Date;
}

export enum TakeawayCategory {
  STRATEGIC_DECISION = 'strategic_decision',
  FINANCIAL_IMPACT = 'financial_impact',
  MARKET_INSIGHT = 'market_insight',
  COMPETITIVE_ANALYSIS = 'competitive_analysis',
  CUSTOMER_FEEDBACK = 'customer_feedback',
  OPERATIONAL_CHANGE = 'operational_change',
  TECHNICAL_DECISION = 'technical_decision',
  RISK_ASSESSMENT = 'risk_assessment',
  OPPORTUNITY_IDENTIFICATION = 'opportunity_identification',
  RESOURCE_ALLOCATION = 'resource_allocation',
  PARTNERSHIP_DEVELOPMENT = 'partnership_development',
  COMPLIANCE_REQUIREMENT = 'compliance_requirement',
  OTHER = 'other',
}

export enum ImportanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BusinessImpactLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  TRANSFORMATIONAL = 'transformational',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class KeyTakeawaysService {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  /**
   * Extract key takeaways from meeting transcription
   */
  async extractKeyTakeaways(
    transcription: MeetingTranscription,
    meetingTitle: string,
  ): Promise<KeyTakeaway[]> {
    try {
      const prompt = this.buildKeyTakeawaysPrompt(transcription.content, meetingTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert business analyst specializing in extracting key takeaways, strategic insights, and important decisions from meeting transcriptions. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const takeaways = JSON.parse(content);

      logger.info('Key takeaways extracted successfully', {
        meetingId: transcription.meeting_id,
        takeawayCount: takeaways.length,
      });

      return takeaways.map((takeaway: any) => ({
        id: '', // Will be set by database
        meeting_id: transcription.meeting_id,
        category: this.mapTakeawayCategory(takeaway.category),
        title: takeaway.title,
        description: takeaway.description,
        importance: this.mapImportanceLevel(takeaway.importance),
        business_impact: this.mapBusinessImpactLevel(takeaway.business_impact),
        stakeholders_affected: takeaway.stakeholders_affected || [],
        financial_implications: takeaway.financial_implications,
        timeline_impact: takeaway.timeline_impact,
        risk_level: this.mapRiskLevel(takeaway.risk_level),
        follow_up_required: takeaway.follow_up_required || false,
        decision_made: takeaway.decision_made || false,
        strategic_insight: takeaway.strategic_insight || false,
        market_implications: takeaway.market_implications,
        competitive_analysis: takeaway.competitive_analysis,
        customer_impact: takeaway.customer_impact,
        operational_changes: takeaway.operational_changes,
        created_at: new Date(),
        updated_at: new Date(),
      }));
    } catch (error: any) {
      logger.error('Failed to extract key takeaways', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to extract key takeaways: ${error.message}`,
        'KEY_TAKEAWAYS_EXTRACTION_FAILED',
        500,
      );
    }
  }

  /**
   * Build prompt for key takeaways extraction
   */
  private buildKeyTakeawaysPrompt(content: string, meetingTitle: string): string {
    return `
You are an expert business analyst specializing in extracting key takeaways, strategic insights, and important decisions from meeting transcriptions. Your task is to identify ALL significant insights, decisions, and strategic information mentioned in the meeting.

CRITICAL EXTRACTION REQUIREMENTS:
1. Extract ALL strategic decisions and important choices made
2. Capture ALL financial implications and budget discussions
3. Identify ALL market insights and competitive analysis
4. Extract ALL customer feedback and market research findings
5. Capture ALL operational changes and process improvements
6. Identify ALL risk assessments and mitigation strategies
7. Extract ALL opportunities and growth potential discussions
8. Capture ALL partnership and collaboration discussions
9. Identify ALL compliance and regulatory requirements
10. Extract ALL resource allocation and capacity planning
11. Capture ALL timeline impacts and scheduling changes
12. Identify ALL stakeholder impacts and communication needs

Return a JSON array with this comprehensive structure:

{
  "key_takeaways": [
    {
      "category": "strategic_decision|financial_impact|market_insight|competitive_analysis|customer_feedback|operational_change|technical_decision|risk_assessment|opportunity_identification|resource_allocation|partnership_development|compliance_requirement|other",
      "title": "Concise title of the key takeaway (5-8 words max)",
      "description": "Detailed description of the insight, decision, or finding",
      "importance": "low|medium|high|critical",
      "business_impact": "minimal|moderate|significant|transformational",
      "stakeholders_affected": ["List of stakeholders or departments affected"],
      "financial_implications": "Specific financial impact or null",
      "timeline_impact": "Impact on project timelines or null",
      "risk_level": "low|medium|high",
      "follow_up_required": true/false,
      "decision_made": true/false,
      "strategic_insight": true/false,
      "market_implications": "Market impact or null",
      "competitive_analysis": "Competitive insights or null",
      "customer_impact": "Customer impact or null",
      "operational_changes": "Operational changes required or null"
    }
  ]
}

Meeting Title: ${meetingTitle}

Transcription:
${content}

COMPREHENSIVE EXTRACTION GUIDELINES:

1. **STRATEGIC DECISIONS**: Extract all major decisions and strategic directions:
   - Business model changes
   - Product strategy shifts
   - Market entry decisions
   - Partnership agreements
   - Investment decisions
   - Organizational changes

2. **FINANCIAL IMPLICATIONS**: Capture all financial discussions:
   - Budget allocations and changes
   - Cost savings opportunities
   - Revenue projections
   - Investment requirements
   - ROI calculations
   - Financial risks and opportunities

3. **MARKET INSIGHTS**: Extract market intelligence and research findings:
   - Market size and growth projections
   - Customer behavior patterns
   - Industry trends and disruptions
   - Market segmentation insights
   - Pricing strategy discussions
   - Market entry barriers

4. **COMPETITIVE ANALYSIS**: Capture competitive intelligence:
   - Competitor moves and strategies
   - Competitive advantages and disadvantages
   - Market positioning discussions
   - Competitive threats and opportunities
   - Benchmarking results
   - Differentiation strategies

5. **CUSTOMER FEEDBACK**: Extract customer insights and feedback:
   - Customer satisfaction levels
   - Feature requests and pain points
   - Customer success stories
   - Churn analysis and retention strategies
   - Customer journey insights
   - Support and service improvements

6. **OPERATIONAL CHANGES**: Identify process and operational improvements:
   - Workflow optimizations
   - Technology implementations
   - Process automation opportunities
   - Resource reallocation
   - Performance improvements
   - Efficiency gains

7. **RISK ASSESSMENTS**: Capture risk analysis and mitigation strategies:
   - Technical risks and challenges
   - Market risks and uncertainties
   - Financial risks and exposures
   - Operational risks and dependencies
   - Compliance risks and requirements
   - Mitigation strategies and contingency plans

8. **OPPORTUNITY IDENTIFICATION**: Extract growth and expansion opportunities:
   - New market opportunities
   - Product expansion possibilities
   - Partnership opportunities
   - Acquisition targets
   - Innovation opportunities
   - Revenue growth strategies

EXAMPLES OF WHAT TO EXTRACT:

**Strategic Decisions:**
- "We decided to pivot to a B2B SaaS model" → Strategic decision with business model change
- "We're expanding into the European market next quarter" → Strategic decision with market expansion
- "We need to acquire a competitor to gain market share" → Strategic decision with acquisition strategy

**Financial Implications:**
- "This could save us $2M annually in operational costs" → Financial impact with cost savings
- "We need to raise $10M in Series B funding" → Financial impact with funding requirement
- "The new pricing model could increase revenue by 40%" → Financial impact with revenue projection

**Market Insights:**
- "Customer research shows 60% prefer mobile-first solutions" → Market insight with customer preference
- "The market is growing at 25% annually" → Market insight with growth projection
- "Enterprise customers are willing to pay 3x more for premium features" → Market insight with pricing opportunity

**Competitive Analysis:**
- "Competitor X just launched a similar feature" → Competitive analysis with feature comparison
- "We have a 6-month advantage over competitors" → Competitive analysis with competitive advantage
- "Our pricing is 30% lower than market leaders" → Competitive analysis with pricing positioning

**Customer Feedback:**
- "Customer satisfaction scores dropped to 7.2/10" → Customer feedback with satisfaction metric
- "Users are requesting integration with Salesforce" → Customer feedback with feature request
- "Support tickets increased by 50% this quarter" → Customer feedback with support metric

**Operational Changes:**
- "We need to implement automated testing to reduce bugs" → Operational change with process improvement
- "The new CRM system will save 20 hours per week" → Operational change with efficiency gain
- "We're moving to a remote-first work model" → Operational change with organizational shift

**Risk Assessments:**
- "Data privacy regulations could impact our European expansion" → Risk assessment with compliance risk
- "Key developer might leave, creating knowledge gap" → Risk assessment with talent risk
- "Supply chain disruptions could delay product launch" → Risk assessment with operational risk

**Opportunity Identification:**
- "Healthcare sector shows 200% growth potential" → Opportunity identification with market opportunity
- "Partnership with Microsoft could accelerate adoption" → Opportunity identification with partnership opportunity
- "AI integration could differentiate us from competitors" → Opportunity identification with innovation opportunity

IMPORTANT NOTES:
- Extract EVERY significant insight, decision, or finding mentioned
- Focus on information that has business impact or strategic importance
- Capture both explicit decisions and implicit insights
- Include quantitative data and metrics when mentioned
- Extract forward-looking statements and projections
- Capture stakeholder concerns and feedback
- Include both positive and negative insights
- Extract information that could influence future decisions

Return empty array only if absolutely no significant insights, decisions, or strategic information are mentioned in the entire transcription.
`;
  }

  /**
   * Map takeaway category string to enum
   */
  private mapTakeawayCategory(category: string): TakeawayCategory {
    switch (category.toLowerCase()) {
      case 'strategic_decision':
        return TakeawayCategory.STRATEGIC_DECISION;
      case 'financial_impact':
        return TakeawayCategory.FINANCIAL_IMPACT;
      case 'market_insight':
        return TakeawayCategory.MARKET_INSIGHT;
      case 'competitive_analysis':
        return TakeawayCategory.COMPETITIVE_ANALYSIS;
      case 'customer_feedback':
        return TakeawayCategory.CUSTOMER_FEEDBACK;
      case 'operational_change':
        return TakeawayCategory.OPERATIONAL_CHANGE;
      case 'technical_decision':
        return TakeawayCategory.TECHNICAL_DECISION;
      case 'risk_assessment':
        return TakeawayCategory.RISK_ASSESSMENT;
      case 'opportunity_identification':
        return TakeawayCategory.OPPORTUNITY_IDENTIFICATION;
      case 'resource_allocation':
        return TakeawayCategory.RESOURCE_ALLOCATION;
      case 'partnership_development':
        return TakeawayCategory.PARTNERSHIP_DEVELOPMENT;
      case 'compliance_requirement':
        return TakeawayCategory.COMPLIANCE_REQUIREMENT;
      case 'other':
        return TakeawayCategory.OTHER;
      default:
        return TakeawayCategory.OTHER;
    }
  }

  /**
   * Map importance level string to enum
   */
  private mapImportanceLevel(importance: string): ImportanceLevel {
    switch (importance.toLowerCase()) {
      case 'critical':
        return ImportanceLevel.CRITICAL;
      case 'high':
        return ImportanceLevel.HIGH;
      case 'medium':
        return ImportanceLevel.MEDIUM;
      case 'low':
        return ImportanceLevel.LOW;
      default:
        return ImportanceLevel.MEDIUM;
    }
  }

  /**
   * Map business impact level string to enum
   */
  private mapBusinessImpactLevel(impact: string): BusinessImpactLevel {
    switch (impact.toLowerCase()) {
      case 'transformational':
        return BusinessImpactLevel.TRANSFORMATIONAL;
      case 'significant':
        return BusinessImpactLevel.SIGNIFICANT;
      case 'moderate':
        return BusinessImpactLevel.MODERATE;
      case 'minimal':
        return BusinessImpactLevel.MINIMAL;
      default:
        return BusinessImpactLevel.MODERATE;
    }
  }

  /**
   * Map risk level string to enum
   */
  private mapRiskLevel(riskLevel: string): RiskLevel {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return RiskLevel.HIGH;
      case 'medium':
        return RiskLevel.MEDIUM;
      case 'low':
        return RiskLevel.LOW;
      default:
        return RiskLevel.MEDIUM;
    }
  }

  /**
   * Health check for Key Takeaways service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1,
      });

      return response.choices.length > 0;
    } catch (error: any) {
      logger.error('Key Takeaways service health check failed', {
        error: error.message,
      });
      return false;
    }
  }
}
