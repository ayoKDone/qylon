# Recall.ai Integration Guide: Complete Automated Meeting Intelligence for Qylon

## Overview

This guide provides a comprehensive implementation strategy for integrating Recall.ai's complete meeting intelligence platform into Qylon's workflow system. The integration enables:

- **Automated Bot Deployment**: Automatic bot deployment for scheduled calendar meetings and on-the-fly meetings
- **Advanced Recording**: Separate audio/video per participant with perfect diarization
- **Real-time Transcription**: Live transcription with multiple provider support
- **Intelligent Action Items**: AI-generated action items from meeting transcripts
- **CRM/PM Integration**: Automatic integration of action items with CRM and project management systems
- **Calendar Integration**: Seamless calendar event management and scheduling

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Calendar      │    │   Qylon API      │    │   Recall.ai     │
│   Integration   │───▶│   Gateway        │───▶│   API           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Meeting       │    │   Meeting        │    │   Bot           │
│   Detection     │    │   Intelligence   │    │   Deployment    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Webhook       │    │   Workflow       │    │   Transcription │
│   Processing    │    │   Automation     │    │   & Analytics   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Separate      │    │   AI Action      │    │   CRM/PM        │
│   Audio/Video   │    │   Item Gen.      │    │   Integration   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Complete Feature Set

### 🎯 **Core Capabilities**
- **Automated Bot Deployment**: Scheduled and on-the-fly meeting bot deployment
- **Advanced Recording**: Separate audio/video per participant with perfect diarization
- **Real-time Transcription**: Live transcription with multiple provider support
- **Intelligent Processing**: AI-generated action items and meeting insights
- **Seamless Integration**: CRM, project management, and calendar integration

### 🔧 **Technical Features**
- **Webhook Security**: HMAC-SHA256 signature verification
- **Error Handling**: Comprehensive error tracking and recovery
- **Performance Monitoring**: Real-time metrics and health checks
- **Scalable Architecture**: Microservices-based design
- **Data Security**: Row-level security and encryption

## Current Implementation Status

### ✅ **Completed Features**
- **API Integration**: Recall.ai API key configured and stored in GitHub secrets
  - Secret Name: `RECALL_AI_API_KEY`
  - Value: `4abfa8884c59898047dcf591a8051158042bb9eb`
- **Service Architecture**: Meeting Intelligence Service (Port 3003) with RecallAIService class
- **Bot Management**: Automated bot creation for meetings with advanced configuration
- **Webhook Processing**: Real-time webhook event handling for status updates
- **Recording Management**: Complete recording lifecycle management
- **Transcription Pipeline**: Multi-provider transcription support (Recall.ai, Deepgram, Assembly AI, AWS Transcribe)
- **CI/CD Integration**: Environment variables configured for testing and deployment

### 🚧 **In Progress**
- **Desktop Application**: Electron app with Recall.ai SDK integration
- **Database Schema**: SDK uploads and meeting recordings tables
- **Real-time Processing**: Live audio streaming and transcription

### 📋 **Planned**
- **Google Calendar Integration**: OAuth 2.0 authentication and calendar event monitoring
- **Meeting Management**: Meeting list, filtering, and transcript access management
- **Action Item Generation**: AI-powered action item extraction from transcripts
- **CRM/PM Integration**: Automatic sync with business tools

## Use Case Scenarios

### 1. **Automated Meeting Recording & Transcription**
- Creates AI bots that automatically join meetings (Zoom, Google Meet, Microsoft Teams)
- Records meetings with high-quality audio/video
- Provides real-time transcription with multiple provider options

### 2. **Meeting Intelligence & Analytics**
- Captures meeting metadata, participant events, and conversation flow
- Generates meeting summaries and action items
- Provides sentiment analysis and key insights

### 3. **Workflow Automation**
- Automatically processes recordings after meetings end
- Triggers content creation workflows based on meeting outcomes
- Integrates with CRM systems for follow-up actions

## API Key Configuration & Security

### **GitHub Secrets Setup**
- **Secret Name**: `RECALL_AI_API_KEY`
- **Value**: `4abfa8884c59898047dcf591a8051158042bb9eb`
- **Status**: ✅ Added to GitHub repository secrets

### **Environment Variables**
- `RECALL_AI_API_KEY`: Main API key for Recall.ai services
- `RECALL_AI_BASE_URL`: API endpoint (https://api.recall.ai/api/v1)
- `RECALL_AI_WEBHOOK_SECRET`: Webhook signature verification

### **Service Integration**
- **Meeting Intelligence Service** (Port 3003)
  - Bot creation and management
  - Recording processing and transcription
  - Webhook event handling
- **CI/CD Pipeline**: Environment variables configured for testing and deployment

## Desktop SDK Integration (Alternative Approach)

### **Why Recall.ai Desktop SDK?**
- **System Audio Capture**: Direct system access for superior quality
- **No Bot Required**: Eliminates compliance concerns and user friction
- **Real-time Processing**: Immediate audio streaming for live transcription
- **Multi-Platform Support**: Works with Zoom, Google Meet, Microsoft Teams, and Slack Huddles
- **Better Quality**: Higher quality audio capture without platform limitations
- **Enhanced Privacy**: Local processing before cloud upload

### **Desktop Application Architecture**
```
Electron App
├── Recall.ai Desktop SDK
├── Meeting Detection
├── Audio Capture
├── Real-time Processing
└── Upload Management
```

### **SDK Integration Code**
```javascript
// Initialize Recall.ai SDK
RecallAiSdk.init({
  apiUrl: "https://us-east-1.recall.ai",
  acquirePermissionsOnStartup: ["accessibility", "screen-capture", "microphone"]
});

// Meeting detection
RecallAiSdk.addEventListener('meeting-detected', async (evt) => {
  const res = await fetch('/api/create_sdk_recording', {
    headers: { 'Authorization': userToken }
  });
  const { upload_token } = await res.json();

  await RecallAiSdk.startRecording({
    windowId: evt.window.id,
    uploadToken: upload_token
  });
});

// Real-time processing
RecallAiSdk.addEventListener('realtime-event', async (evt) => {
  processRealtimeData(evt);
});
```

## Implementation Components

### 1. Enhanced Recall.ai Service

**File**: `services/meeting-intelligence/src/services/RecallAIService.ts`

**Key Features**:
- Enhanced bot creation with configuration options
- Automated deployment for scheduled meetings
- On-the-fly meeting bot deployment
- Bulk bot creation capabilities
- Bot cleanup and management

**New Methods**:
```typescript
// Create bot for scheduled calendar meeting
async createBotForScheduledMeeting(
  meetingUrl: string,
  meetingTitle: string,
  clientId: string,
  teamId?: string,
  scheduledTime?: Date
): Promise<RecallBot>

// Create bot for on-the-fly meeting
async createBotForOnTheFlyMeeting(
  meetingUrl: string,
  clientId: string,
  teamId?: string,
  hostName?: string
): Promise<RecallBot>

// Bulk create bots for multiple meetings
async createBotsForMeetings(meetings: Array<{...}>): Promise<Array<{...}>>

// Cleanup inactive bots
async cleanupInactiveBots(clientId: string, olderThanHours: number): Promise<number>
```

### 2. Automated Bot Deployment Service

**File**: `services/meeting-intelligence/src/services/AutomatedBotDeploymentService.ts`

**Key Features**:
- Orchestrates bot deployment for clients/teams
- Manages deployment configuration
- Handles calendar integration
- Provides deployment status tracking

**Core Methods**:
```typescript
// Deploy bots for all upcoming meetings
async deployBotsForUpcomingMeetings(
  clientId: string,
  teamId?: string,
  hoursAhead: number = 24
): Promise<Array<{...}>>

// Deploy bot for on-the-fly meeting
async deployBotForOnTheFlyMeeting(
  meetingUrl: string,
  clientId: string,
  teamId?: string,
  hostName?: string
): Promise<{...}>

// Get/update deployment configuration
async getBotDeploymentConfig(clientId: string): Promise<BotDeploymentConfig>
async updateBotDeploymentConfig(clientId: string, config: Partial<BotDeploymentConfig>): Promise<void>
```

### 3. API Routes

**File**: `services/meeting-intelligence/src/routes/automated-bot-deployment.ts`

**Endpoints**:
- `POST /api/v1/bot-deployment/deploy/upcoming` - Deploy bots for upcoming meetings
- `POST /api/v1/bot-deployment/deploy/on-the-fly` - Deploy bot for on-the-fly meeting
- `GET /api/v1/bot-deployment/config/:clientId` - Get deployment configuration
- `PUT /api/v1/bot-deployment/config/:clientId` - Update deployment configuration
- `POST /api/v1/bot-deployment/cleanup/:clientId` - Cleanup inactive bots
- `GET /api/v1/bot-deployment/status/:clientId` - Get deployment status

### 4. Webhook Handler

**File**: `services/meeting-intelligence/src/routes/webhooks.ts`

**Handles Recall.ai Events**:
- `bot.joined_call` - Bot successfully joined meeting
- `bot.left_call` - Bot left meeting
- `recording.started` - Recording began
- `recording.stopped` - Recording ended
- `transcription.completed` - Transcription finished
- `bot.error` - Bot encountered error

### 5. Database Schema

**File**: `database/migrations/007_bot_deployment_config.sql`

**New Tables**:
- `client_settings` - Bot deployment configuration per client
- `bot_tracking` - Track deployed bots and their status

**Complete Database Schema**:
```sql
-- SDK Uploads table
CREATE TABLE sdk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recall_upload_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  meeting_id UUID REFERENCES meetings(id),
  status TEXT NOT NULL DEFAULT 'pending',
  upload_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting recordings table
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sdk_upload_id UUID REFERENCES sdk_uploads(id),
  recall_recording_id TEXT UNIQUE NOT NULL,
  meeting_id UUID REFERENCES meetings(id),
  status TEXT NOT NULL DEFAULT 'processing',
  download_url TEXT,
  transcript_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  google_event_id TEXT UNIQUE NOT NULL,
  meeting_id UUID REFERENCES meetings(id),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_url TEXT,
  platform TEXT, -- 'zoom', 'teams', 'google_meet', etc.
  bot_attached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting transcripts table
CREATE TABLE meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  raw_transcript TEXT,
  processed_transcript TEXT,
  speaker_diarization JSONB,
  action_items JSONB,
  key_decisions JSONB,
  sentiment_analysis JSONB,
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Complete Step-by-Step Setup Guide

### Phase 1: Environment Setup & Database Configuration (Week 1)

#### 1.1 Configure Environment Variables ✅ **COMPLETED**

**Environment variables configured with actual API key:**

```bash
# Recall.ai Configuration - ✅ COMPLETED
MEETING_INTELLIGENCE_RECALL_AI_API_KEY=4abfa8884c59898047dcf591a8051158042bb9eb
MEETING_INTELLIGENCE_RECALL_AI_BASE_URL=https://api.recall.ai/api/v1
MEETING_INTELLIGENCE_RECALL_AI_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# GitHub Secrets - ✅ COMPLETED
RECALL_AI_API_KEY=4abfa8884c59898047dcf591a8051158042bb9eb

# OpenAI Configuration for Action Item Generation
MEETING_INTELLIGENCE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Inter-service communication
INTER_SERVICE_TOKEN=your-inter-service-token
WORKFLOW_AUTOMATION_URL=http://localhost:3005
INTEGRATION_MANAGEMENT_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007

# API Gateway URL for webhooks
API_GATEWAY_URL=https://your-api-gateway-url
```

#### 1.2 Run Database Migrations

**Apply all required database migrations:**

```bash
# Apply bot deployment configuration migration
psql -h your-supabase-host -U postgres -d qylon -f database/migrations/007_bot_deployment_config.sql

# Apply enhanced Recall.ai integration migration
psql -h your-supabase-host -U postgres -d qylon -f database/migrations/008_enhanced_recall_integration.sql
```

#### 1.3 Update Service Dependencies

```bash
cd services/meeting-intelligence
npm install
npm run build
```

#### 1.4 Verify Database Schema

**Check that all tables are created correctly:**

```sql
-- Verify new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'client_settings', 'bot_tracking', 'meeting_separate_audios',
    'meeting_separate_videos', 'meeting_realtime_transcriptions',
    'recall_webhook_events', 'transcription_providers', 'action_item_integrations'
);
```

### Phase 2: Recall.ai Account Setup & Webhook Configuration (Week 2)

#### 2.1 Set Up Recall.ai Account

**Create and configure your Recall.ai account:**

1. **Sign up for Recall.ai**: Visit [https://recall.ai](https://recall.ai) and create an account
2. **Get API Key**: Navigate to Dashboard → API Keys → Create New Key
3. **Configure Webhook Secret**: Go to Dashboard → Webhooks → Create New Webhook
   - **Webhook URL**: `https://your-domain.com/api/v1/webhooks/recall-ai`
   - **Events**: Select all bot and recording events
   - **Copy the webhook secret** (starts with `whsec_`)

#### 2.2 Test Enhanced Recall.ai Service

**Test basic bot creation with advanced features:**

```typescript
// Test comprehensive bot creation
const recallService = new RecallAIService();
const bot = await recallService.createBot(
  'https://zoom.us/j/123456789',
  'Qylon Test Bot',
  {
    clientId: 'client-123',
    teamId: 'team-456',
    autoStart: true,
    transcriptionProvider: 'recallai_streaming',
    language: 'en',
    webhookUrl: 'https://your-domain.com/api/v1/webhooks/recall-ai',
    recordingConfig: {
      // Enable separate audio per participant
      audioSeparateRaw: true,
      // Enable separate video per participant
      videoSeparateMp4: true,
      // Enable real-time transcription
      transcript: {
        provider: {
          recallai_streaming: {
            language_code: 'en',
            mode: 'prioritize_low_latency'
          }
        },
        diarization: {
          use_separate_streams_when_available: true
        }
      },
      // Real-time endpoints for live data
      realtimeEndpoints: [
        {
          type: 'webhook',
          url: 'https://your-domain.com/api/v1/webhooks/recall-ai',
          events: [
            'transcript.data',
            'transcript.partial_data',
            'audio_separate_raw.data',
            'video_separate_h264.data'
          ]
        }
      ]
    }
  }
);
```

#### 2.3 Test Automated Deployment Service

**Test automated deployment for scheduled meetings:**

```typescript
// Test automated deployment
const deploymentService = new AutomatedBotDeploymentService();
const results = await deploymentService.deployBotsForUpcomingMeetings(
  'client-123',
  'team-456',
  24 // hours ahead
);

console.log(`Deployed ${results.length} bots for upcoming meetings`);
```

#### 2.4 Configure Webhook Endpoint

**Set up webhook endpoint in Recall.ai dashboard:**

1. **Navigate to Webhooks**: Dashboard → Webhooks → Add Endpoint
2. **Configure Endpoint**:
   - **URL**: `https://your-domain.com/api/v1/webhooks/recall-ai`
   - **Events**: Select all events (bot.*, recording.*, transcript.*, audio_separate_raw.*, video_separate_*.*)
3. **Test Webhook**: Use the test button to verify webhook is working
4. **Copy Webhook Secret**: Save the `whsec_` secret to your environment variables

### Phase 3: Automated Bot Deployment Setup (Week 3)

#### 3.1 Configure Client Bot Deployment Settings

**Set up automated bot deployment for each client:**

```typescript
// Configure bot deployment for a client
const deploymentConfig = {
  clientId: 'client-123',
  autoDeploy: true,
  platforms: ['zoom', 'teams', 'google_meet', 'webex'],
  transcriptionProvider: 'recallai_streaming',
  language: 'en',
  webhookUrl: 'https://your-domain.com/api/v1/webhooks/recall-ai',
  cleanupAfterHours: 24,
  // Advanced recording configuration
  recordingConfig: {
    audioSeparateRaw: true,        // Separate audio per participant
    videoSeparateMp4: true,        // Separate video per participant
    videoSeparateH264: true,       // Real-time video streaming
    realtimeTranscription: true,   // Real-time transcription
    diarization: true,             // Perfect speaker identification
    transcriptionProvider: {
      recallai_streaming: {
        language_code: 'en',
        mode: 'prioritize_low_latency'
      }
    }
  }
};

// Update client settings
await updateBotDeploymentConfig('client-123', deploymentConfig);
```

#### 3.2 Set Up Automated Scheduling

**Create automated bot deployment scheduler:**

```typescript
// Automated bot deployment scheduler
class BotDeploymentScheduler {
  private deploymentService: AutomatedBotDeploymentService;

  constructor() {
    this.deploymentService = new AutomatedBotDeploymentService();
    this.startScheduler();
  }

  private startScheduler() {
    // Run every 15 minutes to check for upcoming meetings
    setInterval(async () => {
      await this.deployBotsForUpcomingMeetings();
    }, 15 * 60 * 1000); // Every 15 minutes

    // Run every hour to cleanup old bots
    setInterval(async () => {
      await this.cleanupOldBots();
    }, 60 * 60 * 1000); // Every hour
  }

  private async deployBotsForUpcomingMeetings() {
    try {
      const clients = await this.getAllActiveClients();

      for (const client of clients) {
        try {
          const config = await this.deploymentService.getBotDeploymentConfig(client.id);

          if (config.autoDeploy) {
            await this.deploymentService.deployBotsForUpcomingMeetings(
              client.id,
              undefined,
              2 // 2 hours ahead
            );

            logger.info('Successfully deployed bots for client', {
              clientId: client.id,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          logger.error('Failed to deploy bots for client', {
            clientId: client.id,
            error: error.message
          });
        }
      }
    } catch (error) {
      logger.error('Bot deployment scheduler error', {
        error: error.message
      });
    }
  }

  private async cleanupOldBots() {
    try {
      const clients = await this.getAllActiveClients();

      for (const client of clients) {
        try {
          const config = await this.deploymentService.getBotDeploymentConfig(client.id);
          await this.deploymentService.cleanupInactiveBots(
            client.id,
            config.cleanupAfterHours
          );
        } catch (error) {
          logger.error('Failed to cleanup bots for client', {
            clientId: client.id,
            error: error.message
          });
        }
      }
    } catch (error) {
      logger.error('Bot cleanup scheduler error', {
        error: error.message
      });
    }
  }
}

// Start the scheduler
const scheduler = new BotDeploymentScheduler();
```

#### 3.3 On-the-Fly Meeting Detection

**Set up real-time meeting URL detection:**

```typescript
// Meeting URL detection patterns
const MEETING_URL_PATTERNS = {
  zoom: /https:\/\/zoom\.us\/j\/\d+/g,
  teams: /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\/]+/g,
  googleMeet: /https:\/\/meet\.google\.com\/[a-z-]+/g,
  webex: /https:\/\/[^\/]+\.webex\.com\/meet\/[^\/]+/g
};

// Detect meeting URLs from text
function detectMeetingUrls(text: string): Array<{url: string, platform: string}> {
  const urls: Array<{url: string, platform: string}> = [];

  Object.entries(MEETING_URL_PATTERNS).forEach(([platform, pattern]) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(url => {
        urls.push({ url, platform });
      });
    }
  });

  return urls;
}

// Deploy bot for on-the-fly meeting
async function deployBotForOnTheFlyMeeting(
  meetingUrl: string,
  clientId: string,
  hostName?: string
) {
  const deploymentService = new AutomatedBotDeploymentService();

  const result = await deploymentService.deployBotForOnTheFlyMeeting(
    meetingUrl,
    clientId,
    undefined, // teamId
    hostName
  );

  logger.info('Deployed bot for on-the-fly meeting', {
    meetingUrl,
    clientId,
    botId: result.botId
  });

  return result;
}
```

### Phase 4: AI Action Item Generation & Processing (Week 4)

#### 4.1 Set Up OpenAI Integration for Action Items

**Configure OpenAI for intelligent action item generation:**

```typescript
// OpenAI Action Item Generation Service
import OpenAI from 'openai';

class ActionItemGenerationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.MEETING_INTELLIGENCE_OPENAI_API_KEY
    });
  }

  async generateActionItemsFromTranscript(
    transcript: string,
    meetingTitle: string,
    participants: Array<{name: string, email?: string, is_host: boolean}>
  ): Promise<Array<{
    description: string;
    assigned_to: string;
    assigned_to_email?: string;
    due_date?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    confidence_score: number;
  }>> {

    const prompt = `
    Analyze the following meeting transcript and extract actionable items.

    Meeting Title: ${meetingTitle}
    Participants: ${participants.map(p => p.name).join(', ')}

    Transcript:
    ${transcript}

    Please extract action items with the following format:
    1. Description: Clear, actionable description
    2. Assigned To: Person responsible (from participants list)
    3. Due Date: If mentioned, otherwise suggest reasonable timeframe
    4. Priority: low, medium, high, or urgent
    5. Confidence: 0.0 to 1.0 based on clarity

    Return as JSON array of objects.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert meeting analyst. Extract clear, actionable items from meeting transcripts. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const actionItems = JSON.parse(content);

      // Validate and enhance action items
      return actionItems.map((item: any) => ({
        description: item.description || item.Description,
        assigned_to: item.assigned_to || item.Assigned_To || 'Unassigned',
        assigned_to_email: this.findParticipantEmail(item.assigned_to, participants),
        due_date: item.due_date ? new Date(item.due_date) : this.suggestDueDate(item.priority),
        priority: this.validatePriority(item.priority),
        confidence_score: Math.min(Math.max(item.confidence || item.Confidence || 0.7, 0), 1)
      }));

    } catch (error) {
      logger.error('Failed to generate action items', {
        error: error.message,
        meetingTitle
      });
      throw error;
    }
  }

  private findParticipantEmail(name: string, participants: Array<{name: string, email?: string}>): string | undefined {
    const participant = participants.find(p =>
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase())
    );
    return participant?.email;
  }

  private suggestDueDate(priority: string): Date {
    const now = new Date();
    switch (priority) {
      case 'urgent': return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'high': return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'medium': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      case 'low': return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
      default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    }
  }

  private validatePriority(priority: string): 'low' | 'medium' | 'high' | 'urgent' {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    return validPriorities.includes(priority?.toLowerCase()) ? priority.toLowerCase() : 'medium';
  }
}

// Initialize the service
const actionItemService = new ActionItemGenerationService();
```

#### 4.2 Process Meeting Transcripts and Generate Action Items

**Set up automatic action item generation from completed meetings:**

```typescript
// Process completed meeting transcripts
async function processCompletedMeeting(meetingId: string) {
  try {
    // Get meeting details
    const meeting = await getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    // Get transcript
    const transcript = await getMeetingTranscript(meetingId);
    if (!transcript) throw new Error('Transcript not available');

    // Get participants
    const participants = await getMeetingParticipants(meetingId);

    // Generate action items using AI
    const actionItems = await actionItemService.generateActionItemsFromTranscript(
      transcript,
      meeting.title,
      participants
    );

    // Save action items to database
    for (const item of actionItems) {
      await createActionItem({
        meeting_id: meetingId,
        description: item.description,
        assigned_to: item.assigned_to,
        assigned_to_email: item.assigned_to_email,
        due_date: item.due_date,
        priority: item.priority,
        confidence_score: item.confidence_score
      });
    }

    logger.info('Generated action items for meeting', {
      meetingId,
      actionItemsCount: actionItems.length
    });

    // Trigger CRM/PM integration
    await triggerActionItemIntegrations(meetingId, actionItems);

  } catch (error) {
    logger.error('Failed to process completed meeting', {
      meetingId,
      error: error.message
    });
  }
}

// Webhook handler for completed transcriptions
async function handleTranscriptCompleted(meetingId: string, transcriptId: string) {
  try {
    // Download and process transcript
    const transcriptData = await recallAIService.downloadTranscript(transcriptId);

    // Convert transcript data to text
    const transcriptText = transcriptData
      .map(participant =>
        participant.words
          .map(word => word.text)
          .join(' ')
      )
      .join('\n');

    // Generate action items
    await processCompletedMeeting(meetingId);

  } catch (error) {
    logger.error('Failed to handle completed transcript', {
      meetingId,
      transcriptId,
      error: error.message
    });
  }
}
```

### Phase 5: CRM & Project Management Integration (Week 5)

#### 5.1 Set Up CRM Integration (Salesforce, HubSpot, Pipedrive)

**Configure CRM integration for action items:**

```typescript
// CRM Integration Service
class CRMIntegrationService {
  private integrationService: IntegrationManagementService;

  constructor() {
    this.integrationService = new IntegrationManagementService();
  }

  async syncActionItemsToCRM(
    actionItems: Array<{
      id: string;
      description: string;
      assigned_to: string;
      assigned_to_email?: string;
      due_date?: Date;
      priority: string;
      meeting_id: string;
    }>,
    clientId: string
  ) {
    try {
      const client = await getClientById(clientId);
      if (!client.crm_integration) {
        logger.warn('No CRM integration configured for client', { clientId });
        return;
      }

      for (const actionItem of actionItems) {
        try {
          // Create task/opportunity in CRM
          const crmTask = await this.createCRMTask(actionItem, client.crm_integration);

          // Update action item with CRM reference
          await updateActionItemIntegration(actionItem.id, {
            integration_type: 'crm',
            external_id: crmTask.id,
            external_url: crmTask.url,
            sync_status: 'synced',
            last_synced_at: new Date()
          });

          logger.info('Synced action item to CRM', {
            actionItemId: actionItem.id,
            crmTaskId: crmTask.id
          });

        } catch (error) {
          logger.error('Failed to sync action item to CRM', {
            actionItemId: actionItem.id,
            error: error.message
          });

          // Mark as failed
          await updateActionItemIntegration(actionItem.id, {
            integration_type: 'crm',
            sync_status: 'failed',
            sync_error: error.message
          });
        }
      }

    } catch (error) {
      logger.error('Failed to sync action items to CRM', {
        clientId,
        error: error.message
      });
    }
  }

  private async createCRMTask(
    actionItem: any,
    crmConfig: any
  ): Promise<{id: string, url: string}> {

    const taskData = {
      subject: `Meeting Action Item: ${actionItem.description}`,
      description: `Generated from meeting: ${actionItem.meeting_id}\n\n${actionItem.description}`,
      assigned_to: actionItem.assigned_to_email || actionItem.assigned_to,
      due_date: actionItem.due_date?.toISOString(),
      priority: this.mapPriorityToCRM(actionItem.priority),
      status: 'Open',
      type: 'Task'
    };

    // Call Integration Management Service
    const response = await fetch(`${process.env.INTEGRATION_MANAGEMENT_URL}/api/v1/crm/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        crm_type: crmConfig.type, // 'salesforce', 'hubspot', 'pipedrive'
        credentials: crmConfig.credentials,
        task_data: taskData
      })
    });

    if (!response.ok) {
      throw new Error(`CRM API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private mapPriorityToCRM(priority: string): string {
    const priorityMap = {
      'urgent': 'High',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return priorityMap[priority] || 'Medium';
  }
}

// Initialize CRM integration service
const crmIntegrationService = new CRMIntegrationService();
```

#### 5.2 Set Up Project Management Integration (Asana, Trello, Monday.com)

**Configure project management integration:**

```typescript
// Project Management Integration Service
class ProjectManagementIntegrationService {
  private integrationService: IntegrationManagementService;

  constructor() {
    this.integrationService = new IntegrationManagementService();
  }

  async syncActionItemsToProjectManagement(
    actionItems: Array<any>,
    clientId: string
  ) {
    try {
      const client = await getClientById(clientId);
      if (!client.project_management_integration) {
        logger.warn('No project management integration configured for client', { clientId });
        return;
      }

      for (const actionItem of actionItems) {
        try {
          // Create task in project management system
          const pmTask = await this.createPMTask(actionItem, client.project_management_integration);

          // Update action item with PM reference
          await updateActionItemIntegration(actionItem.id, {
            integration_type: 'project_management',
            external_id: pmTask.id,
            external_url: pmTask.url,
            sync_status: 'synced',
            last_synced_at: new Date()
          });

          logger.info('Synced action item to project management', {
            actionItemId: actionItem.id,
            pmTaskId: pmTask.id
          });

        } catch (error) {
          logger.error('Failed to sync action item to project management', {
            actionItemId: actionItem.id,
            error: error.message
          });

          // Mark as failed
          await updateActionItemIntegration(actionItem.id, {
            integration_type: 'project_management',
            sync_status: 'failed',
            sync_error: error.message
          });
        }
      }

    } catch (error) {
      logger.error('Failed to sync action items to project management', {
        clientId,
        error: error.message
      });
    }
  }

  private async createPMTask(
    actionItem: any,
    pmConfig: any
  ): Promise<{id: string, url: string}> {

    const taskData = {
      name: actionItem.description,
      description: `Generated from meeting: ${actionItem.meeting_id}\n\nPriority: ${actionItem.priority}\nAssigned to: ${actionItem.assigned_to}`,
      assignee: actionItem.assigned_to_email || actionItem.assigned_to,
      due_date: actionItem.due_date?.toISOString(),
      priority: this.mapPriorityToPM(actionItem.priority),
      status: 'To Do',
      tags: ['meeting-action-item', `priority-${actionItem.priority}`]
    };

    // Call Integration Management Service
    const response = await fetch(`${process.env.INTEGRATION_MANAGEMENT_URL}/api/v1/project-management/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        pm_type: pmConfig.type, // 'asana', 'trello', 'monday'
        credentials: pmConfig.credentials,
        task_data: taskData
      })
    });

    if (!response.ok) {
      throw new Error(`Project Management API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private mapPriorityToPM(priority: string): string {
    const priorityMap = {
      'urgent': 'urgent',
      'high': 'high',
      'medium': 'normal',
      'low': 'low'
    };
    return priorityMap[priority] || 'normal';
  }
}

// Initialize project management integration service
const pmIntegrationService = new ProjectManagementIntegrationService();
```

#### 5.3 Set Up Calendar Integration for Follow-ups

**Configure calendar integration for action item reminders:**

```typescript
// Calendar Integration Service
class CalendarIntegrationService {
  async createFollowUpEvents(
    actionItems: Array<any>,
    clientId: string
  ) {
    try {
      const client = await getClientById(clientId);
      if (!client.calendar_integration) {
        logger.warn('No calendar integration configured for client', { clientId });
        return;
      }

      for (const actionItem of actionItems) {
        if (actionItem.due_date && actionItem.priority === 'urgent') {
          try {
            // Create follow-up calendar event
            const calendarEvent = await this.createFollowUpEvent(actionItem, client.calendar_integration);

            // Update action item with calendar reference
            await updateActionItemIntegration(actionItem.id, {
              integration_type: 'calendar',
              external_id: calendarEvent.id,
              external_url: calendarEvent.url,
              sync_status: 'synced',
              last_synced_at: new Date()
            });

            logger.info('Created follow-up calendar event', {
              actionItemId: actionItem.id,
              calendarEventId: calendarEvent.id
            });

          } catch (error) {
            logger.error('Failed to create follow-up calendar event', {
              actionItemId: actionItem.id,
              error: error.message
            });
          }
        }
      }

    } catch (error) {
      logger.error('Failed to create follow-up calendar events', {
        clientId,
        error: error.message
      });
    }
  }

  private async createFollowUpEvent(
    actionItem: any,
    calendarConfig: any
  ): Promise<{id: string, url: string}> {

    const eventData = {
      title: `Follow-up: ${actionItem.description}`,
      description: `Action item from meeting: ${actionItem.meeting_id}\n\n${actionItem.description}`,
      start_time: actionItem.due_date,
      end_time: new Date(actionItem.due_date.getTime() + 30 * 60 * 1000), // 30 minutes
      attendees: [actionItem.assigned_to_email].filter(Boolean),
      reminder_minutes: [15, 60], // 15 minutes and 1 hour before
      location: 'Virtual Meeting'
    };

    // Call Integration Management Service
    const response = await fetch(`${process.env.INTEGRATION_MANAGEMENT_URL}/api/v1/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        calendar_type: calendarConfig.type, // 'google', 'outlook'
        credentials: calendarConfig.credentials,
        event_data: eventData
      })
    });

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// Initialize calendar integration service
const calendarIntegrationService = new CalendarIntegrationService();
```

#### 5.4 Complete Integration Workflow

**Set up the complete integration workflow:**

```typescript
// Complete Integration Workflow
async function triggerActionItemIntegrations(meetingId: string, actionItems: Array<any>) {
  try {
    const meeting = await getMeetingById(meetingId);
    const clientId = meeting.client_id;

    logger.info('Starting action item integrations', {
      meetingId,
      clientId,
      actionItemsCount: actionItems.length
    });

    // Run integrations in parallel
    await Promise.allSettled([
      // Sync to CRM
      crmIntegrationService.syncActionItemsToCRM(actionItems, clientId),

      // Sync to Project Management
      pmIntegrationService.syncActionItemsToProjectManagement(actionItems, clientId),

      // Create calendar follow-ups
      calendarIntegrationService.createFollowUpEvents(actionItems, clientId),

      // Send notifications
      notificationService.sendActionItemNotifications(actionItems, clientId)
    ]);

    logger.info('Completed action item integrations', {
      meetingId,
      clientId,
      actionItemsCount: actionItems.length
    });

  } catch (error) {
    logger.error('Failed to trigger action item integrations', {
      meetingId,
      error: error.message
    });
  }
}
```

## Complete API Usage Examples

### 1. Deploy Bots for Upcoming Meetings

```bash
curl -X POST https://your-api-gateway.com/api/v1/bot-deployment/deploy/upcoming \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client-123",
    "team_id": "team-456",
    "hours_ahead": 24
  }'
```

### 2. Deploy Bot for On-the-Fly Meeting

```bash
curl -X POST https://your-api-gateway.com/api/v1/bot-deployment/deploy/on-the-fly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_url": "https://zoom.us/j/123456789",
    "client_id": "client-123",
    "team_id": "team-456",
    "host_name": "John Doe"
  }'
```

### 3. Get Separate Audio per Participant

```bash
curl -X GET https://your-api-gateway.com/api/v1/transcription-management/separate-audio/recording-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Separate Video per Participant

```bash
curl -X GET https://your-api-gateway.com/api/v1/transcription-management/separate-video/recording-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Download Meeting Transcript

```bash
curl -X GET https://your-api-gateway.com/api/v1/transcription-management/transcript-456/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Control Bot Recording

```bash
# Pause recording
curl -X POST https://your-api-gateway.com/api/v1/recording-control/pause/bot-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Resume recording
curl -X POST https://your-api-gateway.com/api/v1/recording-control/resume/bot-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get recording status
curl -X GET https://your-api-gateway.com/api/v1/recording-control/status/bot-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Get Bot Troubleshooting Information

```bash
# Get bot status and diagnostics
curl -X GET https://your-api-gateway.com/api/v1/bot-troubleshooting/status/bot-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get bot screenshots for debugging
curl -X GET https://your-api-gateway.com/api/v1/bot-troubleshooting/screenshots/bot-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get troubleshooting guide for specific error
curl -X GET https://your-api-gateway.com/api/v1/bot-troubleshooting/guide/zoom_sdk_credentials_missing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Update Deployment Configuration

```bash
curl -X PUT https://your-api-gateway.com/api/v1/bot-deployment/config/client-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoDeploy": true,
    "platforms": ["zoom", "teams", "google_meet"],
    "transcriptionProvider": "recallai_streaming",
    "language": "en",
    "cleanupAfterHours": 48,
    "recordingConfig": {
      "audioSeparateRaw": true,
      "videoSeparateMp4": true,
      "realtimeTranscription": true,
      "diarization": true
    }
  }'
```

### 9. Get Deployment Status

```bash
curl -X GET https://your-api-gateway.com/api/v1/bot-deployment/status/client-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration Options

### Bot Deployment Configuration

```typescript
interface BotDeploymentConfig {
  clientId: string;
  teamId?: string;
  autoDeploy: boolean;                    // Enable/disable auto-deployment
  platforms: string[];                    // Supported platforms
  transcriptionProvider: 'recallai_streaming' | 'deepgram';
  language: string;                       // Transcription language
  webhookUrl?: string;                    // Custom webhook URL
  cleanupAfterHours: number;              // Auto-cleanup after hours
}
```

### Default Configuration

```json
{
  "autoDeploy": true,
  "platforms": ["zoom", "teams", "google_meet", "webex"],
  "transcriptionProvider": "recallai_streaming",
  "language": "en",
  "cleanupAfterHours": 24
}
```

## Monitoring and Maintenance

### 1. Health Checks

```typescript
// Check Recall.ai service health
const isHealthy = await recallService.healthCheck();

// Check deployment service health
const deploymentStatus = await deploymentService.getDeploymentStatus(clientId);
```

### 2. Error Handling

```typescript
// Comprehensive error handling
try {
  await deploymentService.deployBotsForUpcomingMeetings(clientId);
} catch (error) {
  logger.error('Bot deployment failed', {
    clientId,
    error: error.message,
    stack: error.stack
  });

  // Send alert to monitoring system
  await sendAlert('Bot deployment failed', { clientId, error: error.message });
}
```

### 3. Performance Monitoring

```typescript
// Track deployment metrics
const metrics = {
  totalDeployments: 0,
  successfulDeployments: 0,
  failedDeployments: 0,
  averageDeploymentTime: 0
};
```

## Security Considerations

### 1. API Key Management

- Store Recall.ai API key securely in environment variables
- Use different keys for different environments
- Rotate keys regularly

### 2. Webhook Security

- Implement webhook signature verification
- Use HTTPS for all webhook endpoints
- Validate webhook payloads

### 3. Access Control

- Implement proper authentication for all endpoints
- Use Row Level Security (RLS) for database access
- Validate client permissions before bot deployment

## Troubleshooting

### Common Issues

1. **Bot Creation Fails**
   - Check API key validity
   - Verify meeting URL format
   - Check rate limits

2. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook configuration in Recall.ai
   - Validate webhook signature

3. **Database Connection Issues**
   - Check Supabase connection
   - Verify RLS policies
   - Check database permissions

### Debug Commands

```bash
# Check service health
curl https://your-api-gateway.com/api/v1/meeting-intelligence/health

# Test bot creation
curl -X POST https://your-api-gateway.com/api/v1/meetings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"meeting_url": "https://zoom.us/j/123456789", "client_id": "test"}'

# Check deployment status
curl https://your-api-gateway.com/api/v1/bot-deployment/status/client-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Success Metrics

### Key Performance Indicators

1. **Deployment Success Rate**: >95%
2. **Average Deployment Time**: <30 seconds
3. **Bot Uptime**: >99%
4. **Transcription Accuracy**: >90%
5. **Client Satisfaction**: >90%

### Monitoring Dashboard

Create a dashboard to track:
- Total bot deployments
- Success/failure rates
- Deployment times
- Client usage patterns
- Error rates and types

## Production Deployment Checklist

### Pre-Deployment Verification

- [ ] **Environment Variables**: All required environment variables configured
- [ ] **Database Migrations**: All migrations applied successfully
- [ ] **API Keys**: Recall.ai API key and webhook secret configured
- [ ] **Webhook Endpoint**: Webhook URL accessible and tested
- [ ] **Service Health**: All microservices running and healthy
- [ ] **Database Schema**: All tables created with proper RLS policies
- [ ] **Error Handling**: Comprehensive error handling implemented
- [ ] **Logging**: Structured logging configured
- [ ] **Monitoring**: Health checks and metrics configured

### Deployment Steps

1. **Deploy Database Migrations**:
   ```bash
   # Apply all migrations
   psql -h your-supabase-host -U postgres -d qylon -f database/migrations/007_bot_deployment_config.sql
   psql -h your-supabase-host -U postgres -d qylon -f database/migrations/008_enhanced_recall_integration.sql
   ```

2. **Deploy Meeting Intelligence Service**:
   ```bash
   cd services/meeting-intelligence
   npm run build
   npm run start
   ```

3. **Configure Recall.ai Webhook**:
   - Set webhook URL in Recall.ai dashboard
   - Test webhook with sample events
   - Verify webhook signature validation

4. **Test Complete Workflow**:
   - Create test meeting with bot
   - Verify recording and transcription
   - Test action item generation
   - Verify CRM/PM integration

### Post-Deployment Monitoring

- **Bot Deployment Success Rate**: Monitor bot creation success/failure rates
- **Recording Quality**: Track recording completion and quality metrics
- **Transcription Accuracy**: Monitor transcription accuracy and processing time
- **Action Item Generation**: Track AI-generated action item quality and relevance
- **Integration Success**: Monitor CRM/PM integration success rates
- **Error Rates**: Track and alert on error rates and types

## Team Responsibilities

### **Bill (Chief Architect) - Core Services**
- Meeting Intelligence Service (3003)
- Content Creation Service (3004)
- Workflow Automation Service (3005)
- System Architecture & Infrastructure
- Security Framework & Compliance

### **Wilson - User & Client Management**
- User Management Service (3001)
- Client Management Service (3002)
- User Onboarding & Registration

### **King - Frontend & UI**
- Dashboard Components
- Meeting Intelligence UI
- User Interface & Experience

### **Ayo - Integrations & Video Platforms**
- Integration Management Service (3006)
- Video Platform Integrations
- Real-time Communication

### **John - CRM & Communication**
- Notification Service (3007)
- Analytics & Reporting Service (3008)
- CRM Integrations

### **Favour - Design & UX**
- UI/UX Design System
- Brand Guidelines
- User Experience Optimization

### **Tekena - Quality & Infrastructure**
- Testing Framework
- CI/CD Pipeline
- Infrastructure Support

## Success Metrics & KPIs

### Technical Metrics

- **Bot Deployment Success Rate**: >95%
- **Average Deployment Time**: <30 seconds
- **Recording Completion Rate**: >98%
- **Transcription Accuracy**: >90%
- **Action Item Generation Success**: >95%
- **Integration Sync Success**: >90%

### Business Metrics

- **Client Satisfaction**: >90%
- **Meeting Coverage**: >95% of scheduled meetings
- **Action Item Completion**: >80% of generated action items
- **Time Savings**: >2 hours per week per client
- **ROI**: >300% within 6 months

### Monitoring Dashboard

Create a comprehensive dashboard to track:

- **Real-time Bot Status**: Active bots, deployment status, error rates
- **Meeting Analytics**: Meeting volume, platform distribution, duration
- **Recording Metrics**: Recording success, quality, processing time
- **Transcription Analytics**: Accuracy, processing time, language distribution
- **Action Item Insights**: Generation success, completion rates, priority distribution
- **Integration Health**: CRM/PM sync status, error rates, response times
- **Client Usage**: Per-client metrics, feature adoption, satisfaction scores

## Troubleshooting Guide

### Common Issues & Solutions

1. **Bot Creation Fails**:
   - Check API key validity and permissions
   - Verify meeting URL format and accessibility
   - Check rate limits and quotas
   - Review bot configuration parameters

2. **Webhook Not Receiving Events**:
   - Verify webhook URL is publicly accessible
   - Check webhook configuration in Recall.ai dashboard
   - Validate webhook signature verification
   - Review firewall and network settings

3. **Transcription Issues**:
   - Check transcription provider configuration
   - Verify language settings and provider limits
   - Review audio quality and meeting conditions
   - Check provider API quotas and billing

4. **Action Item Generation Problems**:
   - Verify OpenAI API key and quotas
   - Check transcript quality and completeness
   - Review prompt engineering and model selection
   - Validate participant information accuracy

5. **Integration Sync Failures**:
   - Check CRM/PM API credentials and permissions
   - Verify integration service health and connectivity
   - Review data mapping and transformation logic
   - Check rate limits and API quotas

### Debug Commands

```bash
# Check service health
curl https://your-api-gateway.com/api/v1/meeting-intelligence/health

# Test bot creation
curl -X POST https://your-api-gateway.com/api/v1/meetings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"meeting_url": "https://zoom.us/j/123456789", "client_id": "test"}'

# Check deployment status
curl https://your-api-gateway.com/api/v1/bot-deployment/status/client-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test webhook endpoint
curl -X POST https://your-api-gateway.com/api/v1/webhooks/recall-ai \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check database connectivity
psql -h your-supabase-host -U postgres -d qylon -c "SELECT COUNT(*) FROM meetings;"
```

## Support and Resources

### Technical Documentation

- **Recall.ai Documentation**: https://docs.recall.ai/
- **API Reference**: https://docs.recall.ai/reference/bot_create
- **Webhook Events**: https://docs.recall.ai/reference/webhooks
- **Transcription Providers**: https://docs.recall.ai/reference/transcription
- **Separate Audio/Video**: https://docs.recall.ai/reference/separate_media

### Qylon Team Contacts

- **Chief Architect**: Bill (siwale) - System architecture and technical decisions
- **Integration Management**: Ayo - CRM/PM platform integrations
- **Workflow Automation**: Bill - Automated workflows and action items
- **Notification Service**: John - Client notifications and alerts
- **Analytics & Reporting**: John - Metrics, dashboards, and insights

### External Resources

- **OpenAI API Documentation**: https://platform.openai.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **DigitalOcean App Platform**: https://docs.digitalocean.com/products/app-platform/

---

## Next Steps

### **Immediate Actions (This Week)**
1. ✅ **Set up Recall.ai account** and obtain API credentials - **COMPLETED**
   - API Key: `4abfa8884c59898047dcf591a8051158042bb9eb`
   - Added to GitHub Secrets as `RECALL_AI_API_KEY`
   - Updated CI/CD pipeline with environment variables
2. **Install Recall.ai Desktop SDK** in development environment
3. **Create database schema** for SDK uploads and recordings
4. **Begin desktop application development** with SDK integration

### **Short-term Goals (Next 2 Weeks)**
1. **Complete desktop application** with basic recording functionality
2. **Implement backend services** for SDK upload management
3. **Set up webhook processing** for status updates
4. **Begin testing** with sample meetings

### **Long-term Benefits (Next 3-6 Months)**
1. **Superior audio quality** compared to platform APIs
2. **Reduced compliance concerns** with no bot requirements
3. **Better user experience** with seamless integration
4. **Enhanced reliability** with system-level audio capture

## Summary

This comprehensive Recall.ai integration provides Qylon with enterprise-grade meeting intelligence capabilities:

### ✅ **Complete Feature Set**
- **Automated Bot Deployment**: Scheduled and on-the-fly meeting bot deployment
- **Advanced Recording**: Separate audio/video per participant with perfect diarization
- **Real-time Transcription**: Live transcription with multiple provider support
- **Intelligent Action Items**: AI-generated action items from meeting transcripts
- **Seamless Integration**: CRM, project management, and calendar integration
- **Comprehensive Monitoring**: Real-time metrics, health checks, and troubleshooting

### 🚀 **Business Value**
- **Automated Workflow**: Zero-touch meeting recording and processing
- **Perfect Diarization**: Accurate speaker identification and attribution
- **Intelligent Insights**: AI-generated action items and meeting summaries
- **Seamless Integration**: Automatic sync with existing business tools
- **Scalable Architecture**: Handles high-volume meeting processing
- **Enterprise Security**: Comprehensive security and compliance features

### **Key Success Factors**
- ✅ **System Audio Capture:** Direct system access for superior quality
- ✅ **No Bot Required:** Eliminates compliance concerns and user friction
- ✅ **Real-time Processing:** Immediate audio streaming and transcription
- ✅ **Multi-platform Support:** Works with all major meeting platforms
- ✅ **Enhanced Security:** Local processing and encrypted uploads
- ✅ **Better Performance:** Optimized for real-time audio processing

**Status: READY FOR IMPLEMENTATION**
**Next Step: Begin Phase 1 - Foundation Development**

This integration transforms Qylon into a complete meeting intelligence platform, providing clients with automated meeting recording, transcription, action item generation, and seamless integration with their existing business tools and workflows.
