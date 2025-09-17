# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for comprehensive CI/CD automation, including testing, building, deployment, security scanning, and release management.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Test & Build**: Runs linting, type checking, formatting, and builds the application
- **Deploy to Vercel**: Deploys to production on pushes to `main`
- **Deploy Preview**: Creates preview deployments for pull requests

### 2. Database Migration (`database.yml`)

**Triggers:**
- Push to `main` or `develop` branches affecting `supabase/migrations/**`

**Jobs:**
- **Run Database Migrations**: Applies database schema changes to Supabase
- **Validate Migration Files**: Ensures migration files are valid

### 3. Security & Quality (`security.yml`)

**Triggers:**
- Push/PR to `main` or `develop` branches
- Weekly schedule (Mondays 9 AM UTC)

**Jobs:**
- **Security Scan**: Runs npm audit and CodeQL analysis
- **Dependency Check**: Checks for outdated dependencies and bundle size
- **Lighthouse Performance**: Measures performance, accessibility, and SEO scores

### 4. Release Management (`release.yml`)

**Triggers:**
- Git tag push (e.g., `v1.0.0`)

**Jobs:**
- **Create Release**: Generates changelog and creates GitHub release
- **Deploy to Production**: Deploys tagged version to production
- **Notify Release**: Sends Slack notifications (if configured)

### 5. Issue Management (`issues.yml`)

**Triggers:**
- Issues and PRs opened/closed/labeled

**Features:**
- Auto-labels new issues
- Adds size labels to PRs based on changes
- Manages stale issues and PRs

## Required GitHub Secrets

Set these secrets in your GitHub repository settings:

### Application Secrets
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_HUBSPOT_CLIENT_ID`: HubSpot OAuth client ID
- `VITE_HUBSPOT_CLIENT_SECRET`: HubSpot OAuth client secret
- `VITE_API_BASE_URL`: Production API base URL

### Infrastructure Secrets
- `SUPABASE_ACCESS_TOKEN`: Supabase service role key
- `SUPABASE_PROJECT_REF`: Supabase project reference ID
- `NETLIFY_AUTH_TOKEN`: Netlify authentication token
- `NETLIFY_SITE_ID`: Netlify site ID

### Optional Secrets
- `SLACK_WEBHOOK_URL`: Slack webhook for release notifications

## Setup Instructions

1. **Install GitHub CLI**:
   ```bash
   # Download from https://cli.github.com/
   gh auth login
   ```

2. **Run the setup helper**:
   ```bash
   npm run setup-secrets
   ```

3. **Set secrets using GitHub CLI**:
   ```bash
   gh secret set VITE_SUPABASE_URL --body "https://your-project.supabase.co"
   gh secret set VITE_SUPABASE_ANON_KEY --body "your-anon-key"
   # ... set other secrets
   ```

4. **Or set secrets via GitHub Web UI**:
   - Go to Repository Settings → Secrets and variables → Actions
   - Add each secret with its value

## Workflow Triggers

### Manual Triggers
Some workflows can be triggered manually:
- Security scans: Go to Actions → Security & Quality → Run workflow
- Stale issue management: Go to Actions → Issue Management → Run workflow

### Automatic Triggers
- **CI/CD**: Every push and PR
- **Database**: When migration files change
- **Security**: Weekly + every push/PR
- **Releases**: When version tags are pushed
- **Issues**: When issues/PRs are created/modified

## Branch Protection

Recommended branch protection rules for `main`:

```yaml
# Require PR reviews
required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true

# Require status checks
required_status_checks:
  strict: true
  contexts:
    - test
    - security
    - lighthouse

# Require branches to be up to date
restrictions:
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false
```

## Monitoring & Notifications

### Slack Integration
Set `SLACK_WEBHOOK_URL` to receive notifications for:
- Release deployments
- Failed workflows
- Security vulnerabilities

### GitHub Notifications
Configure repository notifications for:
- Workflow failures
- New releases
- Security alerts

## Troubleshooting

### Common Issues

1. **Workflow doesn't trigger**:
   - Check branch names in workflow triggers
   - Verify file paths for path-based triggers
   - Ensure secrets are set correctly

2. **Build failures**:
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs for specific errors

3. **Deployment issues**:
   - Confirm Netlify tokens and site ID
   - Check build output in `dist/` directory
   - Verify environment variables for production

4. **Database migration failures**:
   - Ensure Supabase credentials are correct
   - Check migration file syntax
   - Verify database permissions

### Debug Commands

```bash
# Check workflow status
gh run list

# View workflow logs
gh run view <run-id>

# Rerun failed workflow
gh run rerun <run-id>

# Check secrets
gh secret list
```

## Performance Optimization

### Caching
- Node.js dependencies are cached automatically
- Build artifacts are cached between runs
- Database connections are optimized

### Parallel Jobs
- Tests run in parallel with builds
- Security scans run independently
- Multiple deployment environments supported

## Security Features

- **CodeQL Analysis**: Automated code security scanning
- **Dependency Auditing**: Regular vulnerability checks
- **Secret Scanning**: Prevents accidental secret commits
- **Branch Protection**: Enforces code review requirements

## Cost Optimization

- **Scheduled Runs**: Security scans run weekly instead of daily
- **Conditional Deployments**: Only deploy when necessary
- **Artifact Cleanup**: Old artifacts are automatically removed
- **Efficient Caching**: Reduces redundant downloads

## Future Enhancements

- [ ] Add end-to-end testing with Playwright
- [ ] Implement blue-green deployments
- [ ] Add canary release strategy
- [ ] Integrate with external monitoring tools
- [ ] Add automated rollback capabilities