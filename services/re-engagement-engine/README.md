# Re-engagement Engine Service

The Re-engagement Engine is a microservice that handles email sequence automation, user behavior tracking, and conversion recovery for the Qylon AI Automation Platform.

## Features

### 1. Email Sequence Automation (Sub-feature 2.5.1)
- Create and manage automated email sequences
- Trigger-based email campaigns
- Multi-step email workflows with delays
- Email delivery tracking and analytics
- Template variable substitution
- Conditional email sending

### 2. User Behavior Tracking (Sub-feature 2.5.2)
- Track user behavior events in real-time
- Generate user behavior profiles
- Calculate engagement scores
- Identify behavior patterns
- Risk factor detection and analysis
- Analytics and reporting

### 3. Conversion Recovery (Sub-feature 2.5.3)
- Create recovery campaigns for at-risk users
- AI-powered personalized content generation
- Multiple recovery strategies (email, outreach, incentives)
- A/B testing for recovery campaigns
- Conversion tracking and metrics
- Automated recovery execution

## API Endpoints

### Email Sequences
- `POST /api/email-sequences` - Create email sequence
- `GET /api/email-sequences` - Get user's email sequences
- `GET /api/email-sequences/:id` - Get specific sequence
- `PUT /api/email-sequences/:id` - Update sequence
- `DELETE /api/email-sequences/:id` - Delete sequence
- `POST /api/email-sequences/:id/execute` - Start execution
- `GET /api/email-sequences/stats/delivery` - Get delivery stats

### Behavior Tracking
- `POST /api/behavior-tracking/events` - Track behavior event
- `GET /api/behavior-tracking/profile` - Get user profile
- `GET /api/behavior-tracking/events` - Get behavior events
- `GET /api/behavior-tracking/at-risk` - Get at-risk users
- `GET /api/behavior-tracking/analytics` - Get analytics
- `POST /api/behavior-tracking/risk-factors/:factor/resolve` - Resolve risk

### Conversion Recovery
- `POST /api/conversion-recovery/campaigns` - Create campaign
- `GET /api/conversion-recovery/campaigns` - Get campaigns
- `GET /api/conversion-recovery/campaigns/:id` - Get specific campaign
- `PUT /api/conversion-recovery/campaigns/:id` - Update campaign
- `DELETE /api/conversion-recovery/campaigns/:id` - Delete campaign
- `POST /api/conversion-recovery/campaigns/:id/execute` - Execute campaign
- `GET /api/conversion-recovery/analytics` - Get recovery analytics

## Environment Variables

```bash
# Service Configuration
PORT=3009
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-jwt-secret-key

# Email Provider Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@qylon.ai
FROM_NAME=Qylon

# AI Configuration
OPENAI_API_KEY=your-openai-api-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Development

### Prerequisites
- Node.js 22.x
- npm >=9.0.0
- Supabase account
- SendGrid account (for email)
- OpenAI account (for AI features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the service:
```bash
npm run dev
```

### Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run integration tests:
```bash
npm run test:integration
```

### Building

Build the service:
```bash
npm run build
```

## Database Schema

The service uses the following main tables:
- `email_sequences` - Email sequence definitions
- `email_steps` - Individual steps in sequences
- `email_sequence_executions` - Active executions
- `email_deliveries` - Email delivery tracking
- `user_behavior_events` - User behavior event logs
- `user_behavior_profiles` - User behavior profiles
- `conversion_recovery_campaigns` - Recovery campaigns
- `conversion_recovery_executions` - Recovery executions
- `ab_tests` - A/B test configurations

## Architecture

The service follows a clean architecture pattern with:
- **Routes** - HTTP request handling and validation
- **Services** - Business logic implementation
- **Types** - TypeScript type definitions
- **Utils** - Utility functions and logging
- **Middleware** - Error handling and request processing

## Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Input validation with Joi
- Rate limiting and CORS protection
- Secure environment variable handling

## Monitoring

- Health check endpoints (`/health`, `/health/ready`, `/health/live`)
- Structured logging with Winston
- Request/response logging
- Performance metrics tracking
- Error tracking and reporting

## Deployment

The service is containerized with Docker and can be deployed to:
- DigitalOcean App Platform
- Kubernetes clusters
- Docker Swarm
- Any container orchestration platform

## Contributing

1. Follow the existing code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting PRs
5. Follow the security guidelines in the main project

## License

MIT License - see the main project LICENSE file for details.
