# Qylon AI Development Guide

**Chief Architect:** Bill (siwale)  
**Repository:** https://github.com/KD-Squares/KDS-Development  
**Last Updated:** January 2025

## 🎯 Purpose

This guide provides comprehensive rules and best practices for using AI tools
(Cursor, GitHub Copilot, ChatGPT, etc.) in the Qylon project to avoid common
pitfalls and ensure production-ready code.

## 🚫 Critical Anti-Patterns to Avoid

### 1. AI Code Generation Pitfalls

#### ❌ NEVER Generate:

- Placeholder code or TODO comments without implementation
- Mock data or fake implementations in production code
- Functions without proper error handling
- API endpoints without authentication
- Database queries without parameterization
- Components without accessibility considerations
- Code without proper logging
- Functions without input validation

#### ✅ ALWAYS Generate:

- Complete, production-ready implementations
- Proper error handling with try-catch blocks
- Input validation and sanitization
- Authentication and authorization checks
- Structured logging with context
- TypeScript types and interfaces
- Unit tests for business logic
- Proper documentation and comments

### 2. Code Editor Anti-Patterns

#### ❌ NEVER Allow:

- Auto-import of unused dependencies
- Code generation without TypeScript types
- Files without proper exports
- Components without error boundaries
- API calls without error handling
- Database models without validation
- Code without testing considerations

#### ✅ ALWAYS Ensure:

- All imports are used and necessary
- Complete TypeScript type coverage
- Proper module exports and imports
- Error boundaries for React components
- Comprehensive error handling
- Input validation for all data
- Test coverage for critical paths

### 3. Architecture Violations

#### ❌ NEVER Create:

- Direct database connections from frontend
- Bypass of the API Gateway
- Circular dependencies between services
- Hardcoded configuration values
- Services without health checks
- Code without environment variable handling
- APIs without rate limiting
- Code without security headers

#### ✅ ALWAYS Follow:

- Microservices architecture boundaries
- API Gateway routing patterns
- Service communication protocols
- Environment-based configuration
- Health check implementations
- Secure environment variable handling
- Rate limiting and security measures
- Proper security headers

## 🔒 Security Requirements

### Authentication & Authorization

```typescript
// ✅ CORRECT: Always validate JWT tokens
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await getUserById(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid user' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// ❌ WRONG: No authentication
export const unprotectedEndpoint = (req: Request, res: Response) => {
  // Direct access without authentication
  res.json({ data: sensitiveData });
};
```

### Input Validation

```typescript
// ✅ CORRECT: Always validate input
import Joi from 'joi';

const createMeetingSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  clientId: Joi.string().uuid().required(),
  startTime: Joi.date().iso().required(),
  duration: Joi.number().min(1).max(480).required(),
});

export const createMeeting = async (req: Request, res: Response) => {
  const { error, value } = createMeetingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Process validated data
  const meeting = await meetingService.create(value);
  res.status(201).json(meeting);
};

// ❌ WRONG: No validation
export const createMeeting = async (req: Request, res: Response) => {
  // Direct use without validation
  const meeting = await meetingService.create(req.body);
  res.json(meeting);
};
```

### Database Security

```sql
-- ✅ CORRECT: Always use RLS policies
CREATE POLICY "Users can view own meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

-- ❌ WRONG: No RLS, direct access
SELECT * FROM meetings WHERE client_id = 'some-id';
```

## 📊 Code Quality Standards

### Error Handling

```typescript
// ✅ CORRECT: Comprehensive error handling
export const processMeeting = async (
  meetingId: string
): Promise<MeetingResult> => {
  try {
    logger.info('Processing meeting started', { meetingId });

    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    const result = await meetingService.process(meeting);

    logger.info('Meeting processed successfully', {
      meetingId,
      processingTime: result.duration,
    });

    return result;
  } catch (error) {
    logger.error('Meeting processing failed', {
      meetingId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// ❌ WRONG: No error handling
export const processMeeting = async (meetingId: string) => {
  const meeting = await getMeetingById(meetingId);
  return await meetingService.process(meeting);
};
```

### Logging Standards

```typescript
// ✅ CORRECT: Structured logging with context
logger.info('User action completed', {
  userId: user.id,
  action: 'meeting_created',
  meetingId: meeting.id,
  clientId: meeting.client_id,
  duration: processingTime,
  timestamp: new Date().toISOString(),
  requestId: req.requestId,
});

// ❌ WRONG: Unstructured logging
console.log('User created meeting');
```

### TypeScript Usage

```typescript
// ✅ CORRECT: Complete type definitions
interface MeetingRequest {
  title: string;
  clientId: string;
  startTime: Date;
  duration: number;
  participants: Participant[];
}

interface MeetingResponse {
  id: string;
  title: string;
  status: MeetingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const createMeeting = async (
  request: MeetingRequest,
  user: User
): Promise<MeetingResponse> => {
  // Implementation with proper types
};

// ❌ WRONG: No types or any types
export const createMeeting = async (request: any, user: any) => {
  // Implementation without types
};
```

## 🧪 Testing Requirements

### Unit Tests

```typescript
// ✅ CORRECT: Comprehensive unit tests
describe('MeetingService', () => {
  describe('createMeeting', () => {
    it('should create meeting with valid data', async () => {
      const mockUser = { id: 'user-1', role: 'admin' };
      const mockRequest = {
        title: 'Test Meeting',
        clientId: 'client-1',
        startTime: new Date(),
        duration: 60,
      };

      const result = await meetingService.createMeeting(mockRequest, mockUser);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockRequest.title);
      expect(result.status).toBe('scheduled');
    });

    it('should throw error for invalid client', async () => {
      const mockUser = { id: 'user-1', role: 'user' };
      const mockRequest = {
        title: 'Test Meeting',
        clientId: 'invalid-client',
        startTime: new Date(),
        duration: 60,
      };

      await expect(
        meetingService.createMeeting(mockRequest, mockUser)
      ).rejects.toThrow('Access denied to client');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db, 'create').mockRejectedValue(new Error('Database error'));

      await expect(
        meetingService.createMeeting(validRequest, validUser)
      ).rejects.toThrow('Database error');
    });
  });
});

// ❌ WRONG: No tests or incomplete tests
describe('MeetingService', () => {
  it('should work', () => {
    // TODO: Write tests
  });
});
```

## 🚀 Deployment Standards

### Environment Variables

```typescript
// ✅ CORRECT: Environment variable validation
import { config } from 'dotenv';
import Joi from 'joi';

config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
}).unknown();

const { error, value: env } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = env;

// ❌ WRONG: Direct access without validation
export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

### Docker Configuration

```dockerfile
# ✅ CORRECT: Multi-stage build with security
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nodejs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]

# ❌ WRONG: Single stage, root user, no optimization
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 API Design Patterns

### RESTful APIs

```typescript
// ✅ CORRECT: Proper REST API design
interface MeetingAPI {
  // GET /api/v1/meetings - List meetings
  listMeetings(filters?: MeetingFilters): Promise<Meeting[]>;

  // GET /api/v1/meetings/:id - Get specific meeting
  getMeeting(id: string): Promise<Meeting>;

  // POST /api/v1/meetings - Create meeting
  createMeeting(meeting: CreateMeetingRequest): Promise<Meeting>;

  // PUT /api/v1/meetings/:id - Update meeting
  updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting>;

  // DELETE /api/v1/meetings/:id - Delete meeting
  deleteMeeting(id: string): Promise<void>;
}

// ❌ WRONG: Inconsistent API design
interface BadAPI {
  getMeetings(): Promise<Meeting[]>;
  getMeetingById(id: string): Promise<Meeting>;
  createNewMeeting(meeting: any): Promise<any>;
  updateMeetingData(id: string, data: any): Promise<any>;
  removeMeeting(id: string): Promise<void>;
}
```

### Error Responses

```typescript
// ✅ CORRECT: Consistent error response format
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

const errorResponses = {
  400: { error: 'Bad Request', message: 'Invalid input data' },
  401: { error: 'Unauthorized', message: 'Authentication required' },
  403: { error: 'Forbidden', message: 'Insufficient permissions' },
  404: { error: 'Not Found', message: 'Resource not found' },
  500: {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  },
};

// ❌ WRONG: Inconsistent error responses
const badErrorResponses = {
  400: 'Bad request',
  401: { message: 'Not authorized' },
  403: { error: 'Forbidden', code: 403 },
  404: 'Not found',
  500: { error: 'Server error', details: 'Something went wrong' },
};
```

## 🎨 Frontend Patterns

### React Components

```typescript
// ✅ CORRECT: Proper React component with error handling
interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onEdit,
  onDelete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onDelete(meeting.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={handleDelete} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
        <CardDescription>{meeting.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Start: {formatDate(meeting.start_time)}</p>
        <p>Status: {meeting.status}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit(meeting)} disabled={isLoading}>
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// ❌ WRONG: No error handling, no loading states
export const BadMeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onEdit,
  onDelete
}) => {
  return (
    <div>
      <h3>{meeting.title}</h3>
      <button onClick={() => onEdit(meeting)}>Edit</button>
      <button onClick={() => onDelete(meeting.id)}>Delete</button>
    </div>
  );
};
```

## 🔧 Development Workflow

### Git Workflow

```bash
# ✅ CORRECT: Proper git workflow
git checkout -b feature/meeting-intelligence-service
git add .
git commit -m "feat: implement meeting intelligence service

- Add Recall.ai SDK integration
- Implement real-time audio processing
- Add OpenAI Whisper integration
- Create speaker diarization
- Add action item extraction

Closes #123"

git push origin feature/meeting-intelligence-service

# ❌ WRONG: Poor git practices
git checkout -b new-feature
git add .
git commit -m "updates"
git push
```

### Code Review Checklist

- [ ] Security vulnerabilities checked
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Logging implemented
- [ ] Tests written and passing
- [ ] Performance considerations addressed
- [ ] Accessibility compliance verified
- [ ] Documentation updated

## 📚 Reference Documents

- **Cursor Rules**: `.cursorrules`
- **Technical Design**: `Qylon Technical Design Doc.md`
- **Feature Assignment**: `Feature Work Assignment.md`
- **Development Status**: `DEVELOPMENT_STATUS.md`
- **VSCode Configuration**: `.vscode/`

## 🚨 Critical Reminders

1. **NEVER** generate code without proper error handling
2. **NEVER** create APIs without authentication
3. **NEVER** bypass the API Gateway
4. **NEVER** commit environment variables
5. **NEVER** create services without health checks
6. **ALWAYS** validate input data
7. **ALWAYS** use proper logging
8. **ALWAYS** implement proper security
9. **ALWAYS** write tests for new code
10. **ALWAYS** follow the microservices boundaries

---

**Remember**: This is a production system handling real user data. Every line of
code must be secure, tested, and production-ready. When in doubt, ask for
clarification rather than making assumptions.
