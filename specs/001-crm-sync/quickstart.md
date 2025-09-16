# Quick Start Guide: CRM Sync Setup

## Prerequisites

### System Requirements

- Node.js 18.0 or higher
- npm 8.0 or higher (or yarn/pnpm)
- Git 2.30 or higher
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Accounts & Access

- HubSpot Developer Account with CRM access
- Supabase project with database access
- Netlify account for deployment (optional)

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd loanark-crm-sync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root:

```env
# HubSpot Configuration
VITE_HUBSPOT_CLIENT_ID=your_hubspot_client_id
VITE_HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
VITE_HUBSPOT_REDIRECT_URI=http://localhost:3000/auth/hubspot/callback

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Database Setup

Run the database migration scripts:

```bash
# Initialize Supabase (if using local development)
npx supabase start

# Apply migrations
npx supabase db push
```

## HubSpot Configuration

### 1. Create HubSpot App

1. Go to [HubSpot Developer](https://developers.hubspot.com/)
2. Create a new Public App
3. Configure OAuth settings:
   - Redirect URI: `http://localhost:3000/auth/hubspot/callback`
   - Scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`

### 2. Get API Credentials

- Copy Client ID and Client Secret to `.env`
- Note your HubSpot Portal ID

### 3. Configure Webhooks (Optional)

For real-time sync, configure webhooks in HubSpot:

- Webhook URL: `https://your-domain.com/api/webhooks/hubspot`
- Events: `contact.creation`, `contact.update`, `contact.deletion`

## Development Setup

### 1. Start Development Server

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend API
npm run server

# Or start both simultaneously
npm run dev:full
```

### 2. Access Application

- Frontend: http://localhost:5173
- API: http://localhost:3000/api

### 3. Initial Configuration

1. Open http://localhost:5173 in your browser
2. Navigate to Settings page
3. Click "Connect to HubSpot"
4. Authorize the application
5. Verify connection status

## Testing the Setup

### 1. Connection Test

```bash
# Test HubSpot connection
curl http://localhost:3000/api/connections/hubspot

# Expected response:
{
  "connected": true,
  "account_info": {
    "portal_id": "12345678",
    "account_name": "Your HubSpot Account"
  }
}
```

### 2. Manual Sync Test

```bash
# Trigger manual sync
curl -X POST http://localhost:3000/api/contacts/sync

# Expected response:
{
  "session_id": "sync_001",
  "message": "Sync initiated successfully",
  "estimated_duration": "2-5 minutes"
}
```

### 3. Data Verification

```bash
# Check sync status
curl http://localhost:3000/api/sync/status

# List contacts
curl http://localhost:3000/api/contacts?page=1&limit=10
```

## User Interface Walkthrough

### 1. Dashboard

- View overall sync statistics
- Monitor connection status
- See recent sync activity
- Access quick actions

### 2. Contacts Page

- Browse all synchronized contacts
- Search and filter contacts
- View detailed contact information
- Manual sync triggers

### 3. Sync Monitor

- Real-time sync progress
- Error tracking and resolution
- Performance metrics
- Historical sync data

### 4. Settings

- HubSpot connection management
- Sync preferences
- API configuration
- User permissions

## Troubleshooting

### Common Issues

#### HubSpot Connection Failed

**Symptoms**: "Connection failed" error
**Solutions**:

1. Verify Client ID and Secret in `.env`
2. Check redirect URI matches HubSpot app configuration
3. Ensure required scopes are granted
4. Clear browser cache and try again

#### Database Connection Error

**Symptoms**: "Database connection failed"
**Solutions**:

1. Verify Supabase credentials
2. Check database is running (if local)
3. Ensure network connectivity
4. Verify database permissions

#### Sync Not Starting

**Symptoms**: Sync button unresponsive
**Solutions**:

1. Check HubSpot connection status
2. Verify API rate limits not exceeded
3. Check server logs for errors
4. Ensure proper permissions

#### UI Not Loading

**Symptoms**: Blank page or loading errors
**Solutions**:

1. Check browser console for JavaScript errors
2. Verify all dependencies installed
3. Clear browser cache
4. Check network connectivity

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
DEBUG=crm-sync:* npm run dev
```

### Logs Location

- Frontend logs: Browser Developer Tools Console
- Backend logs: Terminal output
- Database logs: Supabase dashboard
- Netlify logs: Netlify dashboard (production)

## Next Steps

### Basic Usage

1. **Explore the Interface**: Navigate through all pages
2. **Test Sync Operations**: Trigger manual syncs
3. **Monitor Performance**: Check sync statistics
4. **Review Logs**: Examine sync and error logs

### Advanced Configuration

1. **Schedule Automatic Syncs**: Set up cron jobs
2. **Configure Webhooks**: Enable real-time updates
3. **Set Up Alerts**: Configure monitoring notifications
4. **Optimize Performance**: Tune database indexes

### Production Deployment

1. **Build for Production**:

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables
   - Deploy

3. **Database Migration**:
   - Run production migrations
   - Set up backup schedules
   - Configure monitoring

### Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] API keys rotated regularly
- [ ] Database backups configured
- [ ] Access controls implemented
- [ ] Audit logging enabled

## Support

### Documentation

- API Documentation: `/docs/api`
- User Guide: `/docs/user-guide`
- Troubleshooting: `/docs/troubleshooting`

### Getting Help

- Check existing issues on GitHub
- Review documentation
- Contact development team
- Check community forums

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Wait for review and approval

---

**Setup Time**: 15-30 minutes
**First Sync**: 2-5 minutes
**Full System Ready**: Within 1 hour
