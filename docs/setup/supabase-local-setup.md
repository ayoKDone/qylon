# Supabase Local Development Setup

This guide explains how to set up a portable Supabase instance for local development and testing of the Qylon platform.

## Overview

Supabase provides a complete backend-as-a-service solution that includes:

- PostgreSQL database
- Authentication service
- Real-time subscriptions
- Storage service
- Edge Functions
- Dashboard (Studio)

For local development, we can run Supabase locally using Docker, which provides a complete isolated environment.

## Prerequisites

- Docker and Docker Compose installed
- Supabase CLI installed
- Git installed

## Installation

### 1. Install Supabase CLI

#### macOS (using Homebrew)

```bash
brew install supabase/tap/supabase
```

#### Linux

```bash
curl -fsSL https://supabase.com/install.sh | sh
```

#### Windows (using Scoop)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Verify Installation

```bash
supabase --version
```

## Local Setup

### 1. Initialize Supabase Project

```bash
# Navigate to your Qylon project directory
cd /path/to/qylon

# Initialize Supabase (this creates supabase/ directory)
supabase init
```

This creates the following structure:

```
supabase/
├── config.toml          # Supabase configuration
├── seed.sql            # Database seed data
├── migrations/         # Database migrations
├── functions/          # Edge Functions
└── .gitignore
```

### 2. Configure Supabase

Edit `supabase/config.toml`:

```toml
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "qylon-local"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a table or view. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version_num;` on the remote database to check.
major_version = 15

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://localhost:54321"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 2500
# pop3_port = 1100

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false

# Configure one of the supported SMS providers: `twilio`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Use pre-defined map of phone number to OTP for testing.
[auth.sms.test_otp]
# 4152127777 = "123456"

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
[auth.captcha]
enabled = false
provider = "hcaptcha"
secret = "env(SUPABASE_AUTH_CAPTCHA_SECRET)"

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""

[edge_functions]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
request_policy = "oneshot"
```

### 3. Start Local Supabase

```bash
# Start all Supabase services
supabase start
```

This command will:

- Pull the required Docker images
- Start PostgreSQL, Auth, Storage, and other services
- Run database migrations
- Display connection details

Expected output:

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Update Environment Variables

Update your `.env` file with the local Supabase credentials:

```bash
# Local Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL for direct connections
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# JWT Secret
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

## Database Management

### 1. Run Migrations

```bash
# Apply migrations to local database
supabase db reset

# Or apply specific migration
supabase migration up
```

### 2. Create New Migration

```bash
# Create a new migration file
supabase migration new create_users_table

# This creates: supabase/migrations/YYYYMMDDHHMMSS_create_users_table.sql
```

### 3. Seed Database

```bash
# Run seed data
supabase db seed
```

### 4. View Database Schema

```bash
# Generate TypeScript types from database
supabase gen types typescript --local > types/database.types.ts
```

## Authentication Setup

### 1. Configure Auth Providers

Edit `supabase/config.toml` to enable authentication providers:

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"

[auth.external.github]
enabled = true
client_id = "your-github-client-id"
secret = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET)"
```

### 2. Test Authentication

```bash
# Create a test user
supabase auth signup --email test@example.com --password password123

# Sign in
supabase auth signin --email test@example.com --password password123
```

## Storage Setup

### 1. Create Storage Buckets

```sql
-- Create a bucket for meeting recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-recordings', 'meeting-recordings', false);

-- Create a bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
```

### 2. Set Storage Policies

```sql
-- Allow authenticated users to upload meeting recordings
CREATE POLICY "Users can upload meeting recordings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'meeting-recordings' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their own meeting recordings
CREATE POLICY "Users can view own meeting recordings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'meeting-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Development Workflow

### 1. Daily Development

```bash
# Start Supabase (if not already running)
supabase start

# Start your application
npm run dev

# Stop Supabase when done
supabase stop
```

### 2. Database Changes

```bash
# Make changes to your database schema
# Create migration
supabase migration new your_change_description

# Apply migration
supabase db reset

# Update TypeScript types
supabase gen types typescript --local > types/database.types.ts
```

### 3. Testing

```bash
# Reset database for testing
supabase db reset

# Run tests
npm test
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :54321

# Kill the process
kill -9 <PID>

# Or use different ports in config.toml
```

#### 2. Database Connection Issues

```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### 3. Migration Issues

```bash
# Reset database completely
supabase db reset

# Check migration status
supabase migration list
```

#### 4. Authentication Issues

```bash
# Check auth configuration
supabase status

# View auth logs
supabase logs auth
```

### Useful Commands

```bash
# View all logs
supabase logs

# View specific service logs
supabase logs db
supabase logs auth
supabase logs storage

# Check service status
supabase status

# Stop all services
supabase stop

# Remove all data and restart
supabase db reset
```

## Production Considerations

### 1. Environment Variables

Never commit production secrets to your repository. Use environment variables:

```bash
# Production environment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

### 2. Database Migrations

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Apply migrations to production
supabase db push

# Generate types from production
supabase gen types typescript --project-id your-project-ref > types/database.types.ts
```

### 3. Edge Functions

```bash
# Deploy edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy your-function-name
```

## Integration with Qylon Services

### 1. Update Service Configuration

Each Qylon service should use the local Supabase configuration:

```typescript
// services/api-gateway/src/config/database.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 2. Test Service Integration

```bash
# Start Supabase
supabase start

# Start Qylon services
npm run dev

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3001/health
```

## Next Steps

1. **Set up your local Supabase instance** using this guide
2. **Configure your environment variables** with the local credentials
3. **Run database migrations** to set up your schema
4. **Start developing** with the Qylon services
5. **Test authentication and storage** functionality

For more information, visit the [Supabase Documentation](https://supabase.com/docs/guides/cli/local-development).
