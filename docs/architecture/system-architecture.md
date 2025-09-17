# Qylon System Architecture

**Chief Architect:** Bill (siwale)  
**Last Updated:** January 2025  
**Version:** 2.0

## Architecture Overview

Qylon follows a microservices architecture pattern designed for scalability, maintainability, and independent deployment of services. The system is built on DigitalOcean App Platform with Supabase as the backend-as-a-service provider.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
│  React 18.2+ with Next.js 14+ and TypeScript 5.0+            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API Gateway Layer                           │
│  DigitalOcean Load Balancer + Supabase Edge Functions         │
│  - Authentication & Authorization                              │
│  - Rate Limiting & Request Validation                         │
│  - Request/Response Transformation                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  Microservices Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   User      │ │   Client    │ │  Meeting    │ │  Content    ││
│  │ Management  │ │ Management  │ │Intelligence │ │  Creation   ││
│  │  (3001)     │ │   (3002)    │ │   (3003)    │ │   (3004)    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  Workflow   │ │Integration  │ │Notification │ │  Analytics  ││
│  │Automation   │ │ Management  │ │  Service    │ │ & Reporting ││
│  │  (3005)     │ │   (3006)    │ │   (3007)    │ │   (3008)    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    Data Layer                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Supabase      │ │   Supabase      │ │   Redis Cache   │   │
│  │  PostgreSQL     │ │    Storage      │ │   (Sessions)    │   │
│  │  (Relational)   │ │  (Files/Audio)  │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                External Services Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   OpenAI    │ │ Anthropic   │ │  Recall.ai  │ │   Zoom      ││
│  │   GPT-4     │ │   Claude    │ │ Desktop SDK │ │   Teams     ││
│  │  Whisper    │ │             │ │             │ │ Google Meet ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Microservice Boundaries

### 1. User Management Service (Port 3001)
**Technology:** Node.js/Express  
**Database:** Supabase PostgreSQL (users, sessions, subscriptions, user_preferences)

**Responsibilities:**
- User registration, authentication, and authorization
- Session management and JWT token handling
- Subscription plan management
- User profile and preferences
- Password reset and email verification
- Multi-factor authentication
- Role-based access control

### 2. Client Management Service (Port 3002)
**Technology:** Node.js/Express  
**Database:** Supabase PostgreSQL (clients, client_metrics, client_team_members)

**Responsibilities:**
- Client CRUD operations
- Client onboarding workflow
- Client metrics and analytics
- Client-user relationship management
- Client settings and preferences
- Team member management

### 3. Meeting Intelligence Service (Port 3003)
**Technology:** Python/FastAPI  
**Database:** Supabase PostgreSQL (meetings, participants, meeting_action_items, transcriptions)

**Responsibilities:**
- Integration with Recall.ai Desktop SDK for system audio capture
- Real-time audio processing and transcription using Recall.ai + OpenAI Whisper
- Speaker diarization and identification via Recall.ai
- Action item extraction using AI
- Sentiment analysis
- Meeting insights generation
- Real-time meeting status updates
- Desktop audio recording management

### 4. Content Creation Service (Port 3004)
**Technology:** Python/FastAPI  
**Database:** PostgreSQL (content_pieces, brand_voice_profiles) + MongoDB (content_drafts)

**Responsibilities:**
- AI-powered content generation
- Brand voice profile management
- Content editing and versioning
- Content approval workflows
- Content publishing and distribution
- Content analytics and performance tracking
- Multi-format content support

### 5. Workflow Automation Service (Port 3005)
**Technology:** Node.js/Express  
**Database:** PostgreSQL (workflows, workflow_instances)

**Responsibilities:**
- Workflow definition and management
- Workflow execution engine
- Event-driven automation triggers
- Workflow monitoring and logging
- Error handling and retry logic
- Workflow analytics and reporting
- Conditional logic and branching

### 6. Integration Management Service (Port 3006)
**Technology:** Node.js/Express  
**Database:** PostgreSQL (integrations, integration_logs)

**Responsibilities:**
- Third-party service integrations
- OAuth 2.0 flow management
- API credential management
- Webhook handling and processing
- Integration health monitoring
- Rate limiting and retry logic
- Integration testing and validation

### 7. Notification Service (Port 3007)
**Technology:** Node.js/Express  
**Database:** PostgreSQL (notifications, notification_preferences)

**Responsibilities:**
- Email notifications (SendGrid)
- Push notifications (Firebase)
- SMS notifications (Twilio)
- In-app notifications
- Notification preferences management
- Notification delivery tracking
- Template management

### 8. Analytics & Reporting Service (Port 3008)
**Technology:** Python/FastAPI  
**Database:** MongoDB (analytics_data, reports)

**Responsibilities:**
- Data collection and aggregation
- Custom report generation
- Performance metrics calculation
- Business intelligence dashboards
- Data export and visualization
- Predictive analytics
- Real-time metrics

## Service Communication Patterns

### Synchronous Communication (HTTP/REST)
- Frontend ↔ API Gateway ↔ Microservices
- Service-to-service for real-time operations
- Health checks and service discovery
- Request/response logging and monitoring

### Asynchronous Communication (Message Queues)
- **Supabase Realtime:** Event-driven workflows
- **DigitalOcean Managed Queues:** Pub/sub notifications
- **Event Types:**
  - `meeting.recorded`
  - `meeting.transcribed`
  - `content.generated`
  - `workflow.triggered`
  - `workflow.completed`
  - `integration.connected`
  - `user.registered`
  - `client.created`
  - `notification.sent`

## Data Consistency Patterns
- **Eventual Consistency:** For non-critical data
- **Saga Pattern:** For distributed transactions
- **Event Sourcing:** For audit trails and replay
- **CQRS:** For complex read/write operations

## Scalability, Reliability, and Fault Tolerance

### Scalability
- Microservices allow individual services to scale independently
- DigitalOcean App Platform with auto-scaling for compute resources
- Load balancing across service instances
- Horizontal pod autoscaling (HPA) in Kubernetes

### Reliability
- Redundant deployments across multiple availability zones/regions
- Automated failover mechanisms
- Circuit breakers and bulkheads
- Health checks and self-healing

### Fault Tolerance
- Circuit breakers, bulkheads, and retries between microservices
- Graceful degradation strategies
- Dead letter queues for failed messages
- Comprehensive error handling and logging

## Security Architecture

### Authentication Flow
1. User authenticates via Supabase Auth
2. JWT token issued with user claims
3. Token validated on each API request
4. Row Level Security enforces data access policies

### Data Security
- **Encryption at Rest:** All data encrypted in Supabase database
- **Encryption in Transit:** TLS 1.3 for all communications
- **Row Level Security:** Database-level access control
- **API Security:** Rate limiting and request validation

### Network Security
- **VPC Isolation:** Private networking between services
- **Firewall Rules:** Network-level access control
- **DDoS Protection:** Built-in DDoS mitigation
- **SSL/TLS:** End-to-end encryption

## Monitoring & Observability

### DigitalOcean Monitoring
- **Infrastructure Metrics:** CPU, memory, disk, network monitoring
- **Application Metrics:** Custom application performance metrics
- **Alerting:** Configurable alerts for critical metrics
- **Logs:** Centralized logging with search and filtering

### Supabase Analytics
- **Database Performance:** Query performance and optimization insights
- **API Usage:** API endpoint usage and performance metrics
- **Authentication Analytics:** User authentication and session analytics
- **Storage Analytics:** File upload/download and storage usage metrics

### Custom Monitoring
- **Business Metrics:** Meeting processing time, user engagement
- **Error Tracking:** Application error monitoring and alerting
- **Performance Monitoring:** End-to-end performance tracking
- **User Analytics:** User behavior and feature usage analytics