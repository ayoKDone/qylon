# CI/CD Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Compose Command Not Found

**Error:**

```
docker-compose: command not found
```

**Cause:**

- Docker Compose V2 uses `docker compose` (with space) instead of `docker-compose` (with hyphen)
- CI environment may have Docker Compose V2 installed

**Solution:**
The CI workflow has been updated to handle both versions:

```yaml
# Try Docker Compose V2 first, fallback to V1
if docker compose version &> /dev/null; then
echo "Using Docker Compose V2"
docker compose -f docker-compose.test.yml up -d
else
echo "Using Docker Compose V1"
docker-compose -f docker-compose.test.yml up -d
fi
```

**Local Testing:**

```bash
# Test which version you have
docker compose version  # V2
docker-compose version  # V1

# Use the appropriate command
docker compose -f docker-compose.test.yml up -d  # V2
docker-compose -f docker-compose.test.yml up -d  # V1
```

### 2. Docker Login Authentication Issues

**Error:**

```
Error: Username and password required
```

**Cause:**

- Missing GitHub secrets for DigitalOcean Container Registry
- `DO_REGISTRY_USERNAME` and `DO_REGISTRY_PASSWORD` not configured

**Solution:**
The CI workflow now includes proper error handling and fallback behavior:

1. **Check if credentials are configured**
2. **Skip Docker login if credentials are missing**
3. **Build images locally instead of pushing to registry**

**To Fix Permanently:**

1. **Create DigitalOcean Container Registry:**

   ```bash
   doctl registry create qylon
   ```

2. **Get Registry Credentials:**

   ```bash
   doctl registry login
   # This will show you the username and password
   ```

3. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `DO_REGISTRY_USERNAME`: Your registry username
     - `DO_REGISTRY_PASSWORD`: Your registry password

### 3. Missing Dockerfiles

**Error:**

```
failed to solve: failed to compute cache key: failed to calculate checksum of ref
```

**Cause:**

- Services referenced in `docker-compose.test.yml` are missing Dockerfiles

**Solution:**
Dockerfiles have been created for:

- `services/api-gateway/Dockerfile`
- `services/content-creation/Dockerfile`

**Required Dockerfiles:**
All services need Dockerfiles for the CI/CD pipeline to work:

```
services/
├── api-gateway/Dockerfile ✅
├── meeting-intelligence/Dockerfile ✅
├── content-creation/Dockerfile ✅
├── workflow-automation/Dockerfile ✅
└── [other services]/Dockerfile ❌ (need to be created)
```

### 4. DigitalOcean CLI Authentication Issues

**Error:**

```
Error: Input required and not supplied: token
```

**Cause:**

- Missing GitHub secrets for DigitalOcean App Platform deployment
- `DO_ACCESS_TOKEN` and `DO_APP_ID` not configured

**Solution:**
The CI workflow now includes proper error handling and will skip deployment when credentials are missing:

1. **Check if credentials are configured**
2. **Skip DigitalOcean CLI setup if credentials are missing**
3. **Provide helpful setup instructions**

**To Fix Permanently:**

1. **Create DigitalOcean API Token:**
   - Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
   - Click "Generate New Token"
   - Give it a name (e.g., "Qylon CI/CD")
   - Select "Full Access" or "Custom" with App Platform permissions
   - Copy the token

2. **Create DigitalOcean App Platform App:**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create a new app or use existing one
   - Get the App ID from the app settings

3. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `DO_ACCESS_TOKEN`: Your DigitalOcean API token
     - `DO_APP_ID`: Your DigitalOcean App Platform app ID

**Local Testing:**

```bash
# Install doctl locally
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.142.0/doctl-1.142.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Test deployment
doctl apps create-deployment <your-app-id> --force-rebuild
```

### 5. Testing Locally

**Use the test script:**

```bash
./scripts/test-docker-compose.sh
```

**Manual testing:**

```bash
# Check Docker Compose version
docker compose version || docker-compose version

# Test configuration
docker compose -f docker-compose.test.yml config

# Start services
docker compose -f docker-compose.test.yml up -d

# Check status
docker compose -f docker-compose.test.yml ps

# Stop services
docker compose -f docker-compose.test.yml down
```

### 6. Environment Variables

**Required for CI/CD:**

```bash
# GitHub Secrets (Repository Settings → Secrets)
DO_REGISTRY_USERNAME=your-registry-username
DO_REGISTRY_PASSWORD=your-registry-password
DO_ACCESS_TOKEN=your-digitalocean-token
DO_APP_ID=your-app-platform-id

# Optional
SNYK_TOKEN=your-snyk-token
SLACK_WEBHOOK_URL=your-slack-webhook
```

**Local Development:**

```bash
# Copy example files
cp env.example .env
cp env.services.example .env.services
cp env.local.example .env.local

# Edit with your values
nano .env
```

### 6. Service Health Checks

**Database Services:**

```bash
# PostgreSQL
docker exec qylon_postgres-test_1 pg_isready -U postgres

# Redis
docker exec qylon_redis-test_1 redis-cli ping

# MongoDB
docker exec qylon_mongodb-test_1 mongosh --eval "db.runCommand('ping')"
```

**Application Services:**

```bash
# API Gateway
curl http://localhost:3000/health

# Meeting Intelligence
curl http://localhost:3003/health

# Content Creation
curl http://localhost:3004/health

# Workflow Automation
curl http://localhost:3005/health
```

### 7. Debugging CI/CD Issues

**Check GitHub Actions logs:**

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select the failed workflow run
4. Click on the failed job
5. Expand the failed step to see detailed logs

**Common log locations:**

- Docker build logs: Look for "Build Docker image" step
- Service startup logs: Look for "Start services" step
- Test execution logs: Look for "Run integration tests" step

### 8. Quick Fixes

**If you need to skip Docker registry push:**
The CI workflow will automatically build images locally if registry credentials are missing.

**If you need to skip certain tests:**

```yaml
# In .github/workflows/ci.yml, add conditions:
- name: Run integration tests
  if: github.event_name != 'pull_request' # Skip on PRs
  run: npm run test:integration
```

**If you need to use different Docker Compose version:**

```bash
# Force V1
alias docker-compose='docker-compose'

# Force V2
alias docker-compose='docker compose'
```

## Next Steps

1. **Set up DigitalOcean Container Registry** (if you want to push images)
2. **Add missing Dockerfiles** for remaining services
3. **Configure GitHub Secrets** for production deployment
4. **Test locally** using the provided script
5. **Monitor CI/CD pipeline** for any remaining issues

## Support

If you encounter issues not covered in this guide:

1. Check the GitHub Actions logs for detailed error messages
2. Test locally using the provided scripts
3. Verify all required secrets are configured
4. Ensure all services have proper Dockerfiles
