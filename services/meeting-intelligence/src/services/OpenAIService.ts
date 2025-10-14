import OpenAI from 'openai';
import {
  ActionItem,
  ActionItemCategory,
  MeetingSummary,
  MeetingTranscription,
  PriorityLevel,
  RiskLevel,
  SentimentAnalysis,
  SpeakerSegment,
  TranscriptionError,
} from '../types';
import { logger } from '../utils/logger';

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  /**
   * Extract action items from meeting transcription
   */
  async extractActionItems(
    transcription: MeetingTranscription,
    meetingTitle: string,
  ): Promise<ActionItem[]> {
    try {
      const prompt = this.buildActionItemPrompt(transcription.content, meetingTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert meeting assistant that extracts action items from meeting transcriptions. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const actionItems = JSON.parse(content);

      logger.info('Action items extracted successfully', {
        meetingId: transcription.meeting_id,
        actionItemCount: actionItems.length,
      });

      return actionItems.map((item: any) => ({
        id: '', // Will be set by database
        meeting_id: transcription.meeting_id,
        title: item.title,
        description: item.description,
        assignee: item.assignee,
        due_date: item.due_date ? new Date(item.due_date) : undefined,
        due_time: item.due_time,
        priority: this.mapPriority(item.priority),
        status: 'pending' as const,
        category: this.mapCategory(item.category),
        project: item.project,
        dependencies: item.dependencies || [],
        blockers: item.blockers || [],
        resources_needed: item.resources_needed || [],
        success_criteria: item.success_criteria,
        budget_impact: item.budget_impact,
        budget_allocation: item.budget_allocation,
        cost_center: item.cost_center,
        approval_required: item.approval_required,
        spending_limit: item.spending_limit,
        financial_impact: item.financial_impact,
        stakeholders: item.stakeholders || [],
        communication_requirements: item.communication_requirements,
        technical_requirements: item.technical_requirements,
        quality_standards: item.quality_standards,
        location: item.location,
        meeting_related: item.meeting_related,
        tags: item.tags || [],
        estimated_effort: item.estimated_effort,
        risk_level: this.mapRiskLevel(item.risk_level),
        context: item.context,
        created_at: new Date(),
        updated_at: new Date(),
      }));
    } catch (error: any) {
      logger.error('Failed to extract action items', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to extract action items: ${error.message}`,
        'ACTION_ITEM_EXTRACTION_FAILED',
        500,
      );
    }
  }

  /**
   * Generate meeting summary
   */
  async generateMeetingSummary(
    transcription: MeetingTranscription,
    meetingTitle: string,
  ): Promise<MeetingSummary> {
    try {
      const prompt = this.buildSummaryPrompt(transcription.content, meetingTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert meeting assistant that creates comprehensive meeting summaries. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const summaryData = JSON.parse(content);

      logger.info('Meeting summary generated successfully', {
        meetingId: transcription.meeting_id,
      });

      return {
        id: '', // Will be set by database
        meeting_id: transcription.meeting_id,
        summary: summaryData.summary,
        key_points: summaryData.key_points,
        decisions: summaryData.decisions,
        next_steps: summaryData.next_steps,
        sentiment: summaryData.sentiment,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to generate meeting summary', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to generate meeting summary: ${error.message}`,
        'SUMMARY_GENERATION_FAILED',
        500,
      );
    }
  }

  /**
   * Perform sentiment analysis on meeting transcription
   */
  async analyzeSentiment(transcription: MeetingTranscription): Promise<SentimentAnalysis> {
    try {
      const prompt = this.buildSentimentPrompt(transcription.content);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert sentiment analysis assistant. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const sentimentData = JSON.parse(content);

      logger.info('Sentiment analysis completed successfully', {
        meetingId: transcription.meeting_id,
      });

      return sentimentData;
    } catch (error: any) {
      logger.error('Failed to analyze sentiment', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to analyze sentiment: ${error.message}`,
        'SENTIMENT_ANALYSIS_FAILED',
        500,
      );
    }
  }

  /**
   * Enhance speaker diarization with AI
   */
  async enhanceSpeakerDiarization(speakerSegments: SpeakerSegment[]): Promise<SpeakerSegment[]> {
    try {
      const prompt = this.buildSpeakerEnhancementPrompt(speakerSegments);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at speaker identification and diarization. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const enhancedSegments = JSON.parse(content);

      logger.info('Speaker diarization enhanced successfully', {
        segmentCount: enhancedSegments.length,
      });

      return enhancedSegments;
    } catch (error: any) {
      logger.error('Failed to enhance speaker diarization', {
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to enhance speaker diarization: ${error.message}`,
        'SPEAKER_ENHANCEMENT_FAILED',
        500,
      );
    }
  }

  /**
   * Build prompt for action item extraction
   */
  private buildActionItemPrompt(content: string, meetingTitle: string): string {
    return `
You are an expert meeting analyst specializing in extracting comprehensive action items from meeting transcriptions. Your task is to identify ALL actionable items, commitments, deadlines, and follow-up tasks mentioned in the meeting.

CRITICAL EXTRACTION REQUIREMENTS:
1. Extract EVERY action item, commitment, or task mentioned - no matter how small
2. Capture ALL dates, times, deadlines, and timeframes mentioned
3. Identify project scope, implementation details, and technical requirements
4. Extract dependencies, blockers, and prerequisites
5. Capture COMPREHENSIVE budget, resource, and approval requirements
6. Identify stakeholders, decision makers, and approval chains
7. Extract quality standards, success criteria, and deliverables
8. Capture communication requirements and reporting obligations
9. Extract ALL financial information, budget allocations, and cost implications
10. Capture key takeaways, decisions, and strategic insights
11. Identify budget approvals, spending limits, and financial constraints
12. Extract cost estimates, pricing discussions, and financial planning

Return a JSON array with this comprehensive structure:

{
  "action_items": [
    {
      "title": "Concise, actionable title (5-8 words max)",
      "description": "Detailed description including scope, requirements, and context",
      "assignee": "email@example.com or full name or null if not specified",
      "due_date": "YYYY-MM-DD or null if not specified",
      "due_time": "HH:MM or null if not specified",
      "priority": "low|medium|high|urgent|critical",
      "category": "development|design|testing|documentation|meeting|review|approval|research|planning|implementation|deployment|maintenance|other",
      "project": "Project name or null if not specified",
      "dependencies": ["List of other action items this depends on"],
      "blockers": ["List of potential blockers or risks"],
      "resources_needed": ["List of resources, tools, or approvals needed"],
      "success_criteria": "How success will be measured",
      "budget_impact": "Estimated cost or budget requirement or null",
      "budget_allocation": "Specific budget allocation amount or null",
      "cost_center": "Cost center or department responsible for budget or null",
      "approval_required": "Budget approval required (true/false/null)",
      "spending_limit": "Maximum spending limit or null",
      "financial_impact": "High-level financial impact assessment or null",
      "stakeholders": ["List of people who need to be informed or involved"],
      "communication_requirements": "How and when to communicate progress",
      "technical_requirements": "Technical specifications, tools, or platforms needed",
      "quality_standards": "Quality requirements or standards to meet",
      "location": "Where the work needs to be done or null",
      "meeting_related": "Related to specific meeting agenda item or null",
      "tags": ["Relevant tags for categorization"],
      "estimated_effort": "Time estimate (e.g., '2 hours', '1 day', '1 week') or null",
      "risk_level": "low|medium|high based on potential impact and likelihood",
      "context": "Additional context, background, or reasoning for this action item"
    }
  ]
}

Meeting Title: ${meetingTitle}

Transcription:
${content}

COMPREHENSIVE EXTRACTION GUIDELINES:

1. **Temporal Information**: Extract ALL dates, times, deadlines, and timeframes:
   - "by Friday" → due_date: next Friday
   - "next week" → due_date: next Monday
   - "end of month" → due_date: last day of current month
   - "ASAP" → priority: urgent
   - "before the meeting" → due_date: before next meeting
   - "in 2 weeks" → due_date: 2 weeks from meeting date

2. **Project & Scope Details**: Capture implementation scope:
   - Technical requirements and specifications
   - Feature descriptions and functionality
   - Integration requirements
   - Performance criteria
   - User experience requirements

3. **Resource & Approval Requirements**:
   - Budget approvals needed
   - Resource allocation requirements
   - Tool or software needs
   - External vendor requirements
   - Legal or compliance approvals

4. **COMPREHENSIVE BUDGETING & FINANCIAL INFORMATION**:
   - Budget allocations and spending limits
   - Cost estimates and pricing discussions
   - Financial impact assessments
   - Cost center assignments
   - Budget approval requirements
   - Spending authorization levels
   - ROI calculations and financial justifications
   - Vendor costs and contract negotiations
   - Resource cost implications
   - Financial constraints and limitations

5. **Dependencies & Blockers**:
   - Tasks that must be completed first
   - External dependencies
   - Resource constraints
   - Technical blockers
   - Approval dependencies

6. **Communication & Reporting**:
   - Who needs to be updated
   - Reporting frequency and format
   - Meeting requirements
   - Documentation needs
   - Stakeholder communication

7. **Quality & Success Criteria**:
   - Definition of done
   - Quality standards
   - Testing requirements
   - Review processes
   - Success metrics

8. **Context & Background**:
   - Why this action item exists
   - Business impact
   - Strategic importance
   - Related decisions or discussions

9. **KEY TAKEAWAYS & STRATEGIC INSIGHTS**:
   - Important decisions made during the meeting
   - Strategic direction changes
   - Key insights and learnings
   - Business implications
   - Market considerations
   - Competitive analysis
   - Risk assessments
   - Opportunity identification

EXAMPLES OF WHAT TO EXTRACT:

**Standard Action Items:**
- "John will implement the user authentication by next Friday" → Action item with assignee, due date, technical scope
- "Sarah should schedule a follow-up meeting with the client" → Action item with communication requirement
- "The database migration needs to be tested before deployment" → Action item with dependency and quality requirement
- "Mike will coordinate with the frontend team on the UI changes" → Action item with stakeholder involvement
- "We need to document the API changes for the team" → Action item with documentation requirement
- "The security review must be completed before we can go live" → Action item with blocker and compliance requirement

**BUDGETING & FINANCIAL EXAMPLES:**
- "We need to get budget approval for the new server" → Action item with budget_impact, approval_required: true
- "The project has a $50,000 budget limit" → Action item with spending_limit: "$50,000"
- "Marketing department will cover the advertising costs" → Action item with cost_center: "Marketing"
- "We need CFO approval for any purchase over $10,000" → Action item with approval_required: true, spending_limit: "$10,000"
- "The new software license costs $2,500 per month" → Action item with budget_allocation: "$2,500/month"
- "This could save us $100,000 annually" → Action item with financial_impact: "Cost savings: $100,000 annually"
- "We need to negotiate better pricing with the vendor" → Action item with budget_impact: "Vendor pricing negotiation"

**KEY TAKEAWAYS & STRATEGIC INSIGHTS:**
- "We decided to pivot to a mobile-first approach" → Action item with context: "Strategic pivot to mobile-first approach"
- "The market research shows 40% growth potential" → Action item with context: "Market opportunity: 40% growth potential"
- "Competitor X just launched a similar feature" → Action item with context: "Competitive threat: Competitor X feature launch"
- "Customer feedback indicates high demand for this feature" → Action item with context: "Customer validation: High demand confirmed"
- "We identified a new market segment worth $2M" → Action item with context: "New market opportunity: $2M segment identified"

IMPORTANT NOTES:
- Extract EVERY action item mentioned, even if it seems minor
- If someone says "I'll do X" or "We need to do Y", extract it
- Capture both explicit commitments and implicit follow-up requirements
- Include action items that are conditional or dependent on other factors
- Extract action items from questions that imply follow-up work
- Capture action items that are mentioned as "next steps" or "follow-up items"
- Include action items that require coordination between multiple people
- Extract action items that involve external parties or vendors
- Capture action items that require research, analysis, or investigation
- Include action items that involve decision-making or approval processes

Return empty array only if absolutely no action items, commitments, or follow-up tasks are mentioned in the entire transcription.
`;
  }

  /**
   * Build prompt for meeting summary
   */
  private buildSummaryPrompt(content: string, meetingTitle: string): string {
    return `
Create a comprehensive summary of the following meeting. Return a JSON object with the following structure:

{
  "summary": "2-3 paragraph executive summary",
  "key_points": ["key point 1", "key point 2", ...],
  "decisions": ["decision 1", "decision 2", ...],
  "next_steps": ["next step 1", "next step 2", ...],
  "sentiment": {
    "overall_sentiment": "positive|neutral|negative",
    "confidence": 0.85,
    "speaker_sentiments": {
      "speaker_1": {"sentiment": "positive", "confidence": 0.8},
      "speaker_2": {"sentiment": "neutral", "confidence": 0.7}
    }
  }
}

Meeting Title: ${meetingTitle}

Transcription:
${content}

Guidelines:
- Create a clear, concise executive summary
- Extract 5-10 key points
- List all decisions made
- Identify next steps and follow-ups
- Analyze overall sentiment and per-speaker sentiment
- Be objective and factual
`;
  }

  /**
   * Build prompt for sentiment analysis
   */
  private buildSentimentPrompt(content: string): string {
    return `
Analyze the sentiment of the following meeting transcription. Return a JSON object with the following structure:

{
  "overall_sentiment": "positive|neutral|negative",
  "confidence": 0.85,
  "speaker_sentiments": {
    "speaker_1": {"sentiment": "positive", "confidence": 0.8},
    "speaker_2": {"sentiment": "neutral", "confidence": 0.7}
  }
}

Transcription:
${content}

Guidelines:
- Analyze the overall tone and sentiment of the meeting
- Provide confidence scores (0-1)
- Analyze sentiment for each speaker if identifiable
- Consider context, not just individual words
- Be objective in your analysis
`;
  }

  /**
   * Build prompt for speaker enhancement
   */
  private buildSpeakerEnhancementPrompt(segments: SpeakerSegment[]): string {
    const segmentsText = segments.map(seg => `Speaker ${seg.speaker_id}: ${seg.text}`).join('\n');

    return `
Enhance the speaker diarization for the following meeting segments. Return a JSON array with enhanced speaker information:

{
  "enhanced_segments": [
    {
      "speaker_id": "speaker_1",
      "speaker_name": "John Doe (if identifiable)",
      "start_time": 0,
      "end_time": 10.5,
      "text": "Hello everyone...",
      "confidence": 0.95
    }
  ]
}

Meeting Segments:
${segmentsText}

Guidelines:
- Try to identify speaker names if possible
- Maintain original timing information
- Improve confidence scores based on context
- Keep speaker_id consistent for the same person
- If speaker name cannot be determined, keep speaker_id
`;
  }

  /**
   * Map priority string to enum
   */
  private mapPriority(priority: string): PriorityLevel {
    switch (priority.toLowerCase()) {
      case 'critical':
        return PriorityLevel.CRITICAL;
      case 'urgent':
        return PriorityLevel.URGENT;
      case 'high':
        return PriorityLevel.HIGH;
      case 'medium':
        return PriorityLevel.MEDIUM;
      case 'low':
        return PriorityLevel.LOW;
      default:
        return PriorityLevel.MEDIUM;
    }
  }

  /**
   * Map category string to enum
   */
  private mapCategory(category: string): ActionItemCategory | undefined {
    if (!category) return undefined;

    switch (category.toLowerCase()) {
      case 'development':
        return ActionItemCategory.DEVELOPMENT;
      case 'design':
        return ActionItemCategory.DESIGN;
      case 'testing':
        return ActionItemCategory.TESTING;
      case 'documentation':
        return ActionItemCategory.DOCUMENTATION;
      case 'meeting':
        return ActionItemCategory.MEETING;
      case 'review':
        return ActionItemCategory.REVIEW;
      case 'approval':
        return ActionItemCategory.APPROVAL;
      case 'research':
        return ActionItemCategory.RESEARCH;
      case 'planning':
        return ActionItemCategory.PLANNING;
      case 'implementation':
        return ActionItemCategory.IMPLEMENTATION;
      case 'deployment':
        return ActionItemCategory.DEPLOYMENT;
      case 'maintenance':
        return ActionItemCategory.MAINTENANCE;
      case 'other':
        return ActionItemCategory.OTHER;
      default:
        return ActionItemCategory.OTHER;
    }
  }

  /**
   * Map risk level string to enum
   */
  private mapRiskLevel(riskLevel: string): RiskLevel | undefined {
    if (!riskLevel) return undefined;

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
   * Health check for OpenAI service
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
      logger.error('OpenAI health check failed', {
        error: error.message,
      });
      return false;
    }
  }
}
