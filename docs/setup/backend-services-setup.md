# Backend Services Development Setup

This guide explains how to set up and develop the backend microservices for the Qylon platform.

## Overview

Qylon uses a microservices architecture with the following backend services:

- **API Gateway** (Port 3000) - Request routing and authentication
- **Security Service** (Port 3001) - Authentication, authorization, and API key management
- **User Management** (Port 3002) - User accounts and profiles
- **Client Management** (Port 3003) - Client organizations and relationships
- **Meeting Intelligence** (Port 3004) - Meeting transcription and AI processing
- **Content Creation** (Port 3005) - AI-powered content generation
- **Workflow Automation** (Port 3006) - State machine-based workflow execution
- **Integration Management** (Port 3007) - Third-party integrations
- **Notification Service** (Port 3008) - Email and push notifications
- **Analytics & Reporting** (Port 3009) - Data analytics and reporting

## Prerequisites

- Node.js >= 20.0.0
- Python >= 3.11
- Docker and Docker Compose
- PostgreSQL >= 15
- Redis >= 7
- Git

## Service Architecture

### Technology Stack

**Node.js Services:**
- Express.js framework
- TypeScript for type safety
- Winston for logging
- Jest for testing
- Supabase for database and auth

**Python Services:**
- FastAPI framework
- Pydantic for data validation
- SQLAlchemy for database ORM
- pytest for testing
- OpenAI and Anthropic APIs

### Service Communication

```
Frontend (React/Next.js)
    ↓ HTTP/HTTPS
API Gateway (Port 3000)
    ↓ Internal Network
Microservices (Ports 3001-3009)
    ↓ Database Connections
PostgreSQL + Redis + MongoDB
```

## Individual Service Setup

### 1. API Gateway Service

**Location:** `services/api-gateway/`

**Purpose:** Central entry point for all client requests, handles routing, authentication, and rate limiting.

**Setup:**
```bash
cd services/api-gateway
npm install
npm run dev
```

**Key Features:**
- Request routing to microservices
- JWT authentication middleware
- Rate limiting with Redis
- Request/response logging
- Health check endpoints
- CORS configuration

**Environment Variables:**
```bash
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-jwt-secret-key
REDIS_URL=redis://localhost:6379
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Security Service

**Location:** `services/security/`

**Purpose:** Handles authentication, authorization, API key management, and Row Level Security policies.

**Setup:**
```bash
cd services/security
npm install
npm run dev
```

**Key Features:**
- Supabase Auth integration
- API key generation and validation
- Row Level Security (RLS) policies
- JWT token management
- User permission system
- Security middleware

**Environment Variables:**
```bash
NODE_ENV=development
PORT=3001
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-jwt-secret-key
API_KEY_LENGTH=32
API_KEY_PREFIX=qyl_
ENCRYPTION_KEY=your-encryption-key-32-characters-long
```

### 3. Meeting Intelligence Service

**Location:** `services/meeting-intelligence/`

**Purpose:** Processes meeting recordings, generates transcriptions, extracts action items, and provides AI-powered meeting insights.

**Setup:**
```bash
cd services/meeting-intelligence
npm install
npm run dev
```

**Key Features:**
- Recall.ai integration for meeting recording
- OpenAI Whisper for transcription
- Speaker diarization
- Action item extraction
- Meeting summarization
- Sentiment analysis
- Real-time processing

**Environment Variables:**
```bash
NODE_ENV=development
PORT=3004
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key
RECALL_AI_API_KEY=your-recall-ai-api-key
RECALL_AI_BASE_URL=https://us-east-1.recall.ai
AUDIO_MAX_FILE_SIZE=100MB
DIARIZATION_ENABLED=true
```

### 4. Workflow Automation Service

**Location:** `services/workflow-automation/`

**Purpose:** Manages state machine-based workflows, handles event processing, and provides compensation logic for failed operations.

**Setup:**
```bash
cd services/workflow-automation
npm install
npm run dev
```

**Key Features:**
- XState-based state machines
- Workflow definition and execution
- Event sourcing and replay
- Compensation logic
- Retry mechanisms
- Workflow monitoring
- Parallel execution

**Environment Variables:**
```bash
NODE_ENV=development
PORT=3006
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
STATE_MACHINE_TIMEOUT=300000
MAX_CONCURRENT_WORKFLOWS=10
EVENT_BATCH_SIZE=100
COMPENSATION_ENABLED=true
```

## Development Workflow

### 1. Start All Services

**Using Docker Compose (Recommended):**
```bash
# Start all services with dependencies
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

**Using npm scripts:**
```bash
# Start all services locally
npm run dev

# Start individual services
npm run dev:api-gateway
npm run dev:security
npm run dev:meeting-intelligence
npm run dev:workflow-automation
```

### 2. Service Development

**Create a new service:**
```bash
# Create service directory
mkdir services/new-service
cd services/new-service

# Initialize package.json
npm init -y

# Install dependencies
npm install express typescript @types/node @types/express
npm install winston @supabase/supabase-js zod
npm install -D @types/jest jest ts-jest nodemon

# Create basic structure
mkdir src
mkdir src/routes
mkdir src/middleware
mkdir src/services
mkdir src/types
mkdir src/utils
```

**Basic service structure:**
```
services/new-service/
├── src/
│   ├── index.ts           # Main entry point
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

### 3. Testing Services

**Unit Testing:**
```bash
# Run tests for specific service
cd services/security
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Integration Testing:**
```bash
# Run integration tests
npm run test:integration

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3004/health
curl http://localhost:3006/health
```

**End-to-End Testing:**
```bash
# Run E2E tests
npm run test:e2e

# Test complete workflows
npm run test:workflows
```

## Database Integration

### 1. Supabase Integration

**Client Setup:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Database Operations:**
```typescript
// Example: Create a meeting
export async function createMeeting(meetingData: CreateMeetingRequest) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meetingData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create meeting: ${error.message}`);
  }

  return data;
}
```

### 2. Redis Integration

**Client Setup:**
```typescript
// src/lib/redis.ts
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

await redisClient.connect();

export { redisClient };
```

**Caching Operations:**
```typescript
// Example: Cache meeting data
export async function cacheMeeting(meetingId: string, meetingData: any) {
  await redisClient.setEx(
    `meeting:${meetingId}`,
    3600, // 1 hour
    JSON.stringify(meetingData)
  );
}

export async function getCachedMeeting(meetingId: string) {
  const cached = await redisClient.get(`meeting:${meetingId}`);
  return cached ? JSON.parse(cached) : null;
}
```

## API Development

### 1. Route Structure

**Express Router Setup:**
```typescript
// src/routes/meetings.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { createMeeting, getMeetings } from '../services/MeetingService';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /meetings - List meetings
router.get('/', asyncHandler(async (req, res) => {
  const meetings = await getMeetings(req.user.id);
  res.json({ success: true, data: meetings });
}));

// POST /meetings - Create meeting
router.post('/', asyncHandler(async (req, res) => {
  const meeting = await createMeeting(req.body, req.user.id);
  res.status(201).json({ success: true, data: meeting });
}));

export default router;
```

### 2. Middleware

**Authentication Middleware:**
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

**Error Handling Middleware:**
```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
}
```

### 3. Service Layer

**Business Logic:**
```typescript
// src/services/MeetingService.ts
import { supabase } from '../lib/supabase';
import { CreateMeetingRequest, Meeting } from '../types/meeting';

export class MeetingService {
  async createMeeting(data: CreateMeetingRequest, userId: string): Promise<Meeting> {
    // Validate input
    if (!data.title || !data.client_id) {
      throw new Error('Title and client_id are required');
    }

    // Check client access
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', data.client_id)
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found or access denied');
    }

    // Create meeting
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        ...data,
        user_id: userId,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }

    return meeting;
  }

  async getMeetings(userId: string): Promise<Meeting[]> {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        *,
        clients!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('clients.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }

    return meetings;
  }
}
```

## Monitoring and Logging

### 1. Structured Logging

**Winston Configuration:**
```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'meeting-intelligence' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
```

**Usage:**
```typescript
import logger from '../utils/logger';

// Log info
logger.info('Meeting created', {
  meetingId: meeting.id,
  userId: user.id,
  clientId: client.id,
});

// Log errors
logger.error('Failed to process meeting', {
  error: error.message,
  meetingId: meeting.id,
  stack: error.stack,
});
```

### 2. Health Checks

**Health Check Endpoint:**
```typescript
// src/routes/health.ts
import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { redisClient } from '../lib/redis';

const router = Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'meeting-intelligence',
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {
      database: 'unknown',
      redis: 'unknown',
      openai: 'unknown',
    },
  };

  try {
    // Check database
    const { error: dbError } = await supabase.from('meetings').select('id').limit(1);
    health.dependencies.database = dbError ? 'unhealthy' : 'healthy';

    // Check Redis
    await redisClient.ping();
    health.dependencies.redis = 'healthy';
  } catch (error) {
    health.dependencies.redis = 'unhealthy';
  }

  // Check OpenAI
  try {
    // Simple API key validation
    if (process.env.OPENAI_API_KEY) {
      health.dependencies.openai = 'healthy';
    } else {
      health.dependencies.openai = 'unhealthy';
    }
  } catch (error) {
    health.dependencies.openai = 'unhealthy';
  }

  const isHealthy = Object.values(health.dependencies).every(status => status === 'healthy');
  res.status(isHealthy ? 200 : 503).json(health);
});

export default router;
```

## Deployment

### 1. Docker Configuration

**Dockerfile:**
```dockerfile
# services/meeting-intelligence/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

# Start service
CMD ["npm", "start"]
```

### 2. Environment Configuration

**Production Environment:**
```bash
NODE_ENV=production
PORT=3004
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
OPENAI_API_KEY=your-production-openai-key
RECALL_AI_API_KEY=your-production-recall-key
LOG_LEVEL=info
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check port conflicts
lsof -i :3004

# Restart service
docker-compose restart service-name
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# Test connection
psql -h localhost -p 5432 -U postgres -d qylon_dev

# Restart database
docker-compose restart postgres
```

#### 3. Authentication Issues
- Verify JWT secret is consistent across services
- Check Supabase URL and keys
- Ensure RLS policies are properly configured

### Useful Commands

```bash
# View service logs
docker-compose logs -f service-name

# Restart specific service
docker-compose restart service-name

# Rebuild and restart
docker-compose up --build service-name

# Check service health
curl http://localhost:3004/health

# Test API endpoints
curl -H "Authorization: Bearer <token>" http://localhost:3004/meetings
```

## Next Steps

1. **Set up individual services** using this guide
2. **Configure service communication** and API routing
3. **Implement business logic** for each service
4. **Add comprehensive testing** and monitoring
5. **Deploy to production** environment

For more information, visit the [Express.js Documentation](https://expressjs.com/) and [Supabase Documentation](https://supabase.com/docs).