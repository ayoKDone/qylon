# Security Setup Guide

This guide explains how to set up security scanning for the Qylon project using Snyk and other security tools.

## 🔒 Snyk Security Scanning

Snyk provides comprehensive security scanning for dependencies and container images. The GitHub Actions workflow includes Snyk scanning, but requires configuration.

### Prerequisites

1. **Snyk Account**: Sign up for a free account at [https://snyk.io](https://snyk.io)
2. **GitHub Repository Access**: Admin access to the repository settings

### Setup Instructions

#### Step 1: Get Your Snyk API Token

1. Go to [https://app.snyk.io/account](https://app.snyk.io/account)
2. Navigate to **General** → **API Token**
3. Click **Click to show** to reveal your token
4. Copy the token (it starts with `snyk_`)

#### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SNYK_TOKEN`
5. Value: Paste your Snyk API token
6. Click **Add secret**

#### Step 3: Verify Setup

1. Push a commit to trigger the GitHub Actions workflow
2. Check the **Security Scan** job in the Actions tab
3. You should see "✅ SNYK_TOKEN found. Running Snyk security scan."

### Snyk Features

- **Dependency Scanning**: Scans npm packages for known vulnerabilities
- **Container Scanning**: Scans Docker images for security issues
- **License Compliance**: Checks for problematic licenses
- **Severity Thresholds**: Configurable severity levels (low, medium, high, critical)

### Configuration Options

The current Snyk configuration in `.github/workflows/ci.yml`:

```yaml
- name: Run Snyk security scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
  continue-on-error: true
  if: ${{ secrets.SNYK_TOKEN != '' }}
```

**Key Features:**

- `--severity-threshold=high`: Only fails on high/critical vulnerabilities
- `continue-on-error: true`: Workflow continues even if Snyk finds issues
- `if: ${{ secrets.SNYK_TOKEN != '' }}`: Only runs if token is configured

### Troubleshooting

#### Authentication Error (SNYK-0005)

```
ERROR   Authentication error (SNYK-0005)
Authentication credentials not recognized, or user access is not provisioned.
```

**Solutions:**

1. Verify the `SNYK_TOKEN` secret is correctly set in GitHub
2. Ensure the token is valid and not expired
3. Check that your Snyk account has the necessary permissions

#### Missing Token Warning

```
⚠️ SNYK_TOKEN secret not configured. Skipping Snyk security scan.
```

**Solution:** Follow the setup instructions above to configure the token.

### Alternative Security Tools

If you prefer not to use Snyk, the workflow also includes:

1. **npm audit**: Built-in npm security scanning
2. **Docker security scanning**: Available through DigitalOcean Container Registry
3. **GitHub Security Advisories**: Automatic vulnerability alerts

### Best Practices

1. **Regular Updates**: Keep dependencies updated to latest secure versions
2. **Monitor Alerts**: Review Snyk dashboard regularly for new vulnerabilities
3. **Fix High/Critical Issues**: Address high and critical severity issues promptly
4. **License Compliance**: Review and approve licenses for all dependencies

### Snyk Dashboard

Once configured, you can:

- View detailed vulnerability reports at [https://app.snyk.io](https://app.snyk.io)
- Set up email/Slack notifications for new vulnerabilities
- Configure auto-fix pull requests for simple updates
- Monitor multiple projects and repositories

## 🔐 Additional Security Measures

### Environment Variables

- Never commit secrets to the repository
- Use GitHub Secrets for sensitive configuration
- Rotate tokens regularly

### Dependencies

- Use `npm audit` locally before committing
- Keep dependencies updated
- Use `package-lock.json` for consistent installs

### Container Security

- Use minimal base images
- Scan images before deployment
- Keep base images updated

### Code Security

- Use ESLint security rules
- Implement proper input validation
- Follow OWASP security guidelines

## 📞 Support

For issues with Snyk setup:

- [Snyk Documentation](https://docs.snyk.io/)
- [Snyk Support](https://support.snyk.io/)
- [GitHub Actions Snyk Action](https://github.com/snyk/actions)

For general security questions:

- Review the project's security policy
- Contact the development team
- Report security issues through proper channels
