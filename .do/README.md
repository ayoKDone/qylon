# DigitalOcean App Platform Configuration

## Configuration Files

This directory contains the DigitalOcean App Platform configuration files for the Qylon application.

### Active Configuration
- `app.yaml` - **PRIMARY CONFIGURATION FILE** - This is the only configuration file that should be used for deployments.

### Backup Files
- `app.yaml.backup` - Backup of the previous configuration (created during cleanup)

## ⚠️ CRITICAL RULES

### 1. SINGLE CONFIGURATION RULE
- **ONLY ONE** `app.yaml` file should exist in this directory
- **NEVER** create multiple configuration files (app-*.yaml, app-*.yml, app-*.json)
- **NEVER** create duplicate configurations with different names

### 2. CONFIGURATION MANAGEMENT
- **ALWAYS** modify the existing `app.yaml` file
- **NEVER** create new configuration files for testing or experimentation
- **ALWAYS** test configuration changes locally before deployment

### 3. DEPLOYMENT CONSISTENCY
- **ONLY** the `app.yaml` file in this directory is used for deployments
- **NEVER** reference other configuration files in deployment scripts
- **ALWAYS** ensure the configuration is valid before committing

### 4. TROUBLESHOOTING
- If deployment issues occur, **DO NOT** create new configuration files
- **ALWAYS** fix the existing `app.yaml` file
- **NEVER** create workaround configurations

## Configuration Structure

The `app.yaml` file contains:
- **Services**: API Gateway and microservices configuration
- **Static Sites**: Frontend deployment configuration
- **Databases**: PostgreSQL database configuration
- **Domains**: Custom domain configuration

## Deployment Process

1. Modify `app.yaml` as needed
2. Test configuration locally
3. Commit changes to git
4. DigitalOcean automatically deploys using the updated configuration

## Emergency Procedures

If the configuration becomes corrupted:
1. Restore from `app.yaml.backup`
2. Make necessary corrections
3. Commit and deploy

**Remember**: Multiple configuration files cause deployment confusion and routing conflicts. Always use a single, well-maintained configuration file.
