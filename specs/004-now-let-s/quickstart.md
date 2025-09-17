# Quickstart: Email Verification Status Sync

**Date**: September 17, 2025
**Feature**: Email Verification Status Sync
**Branch**: 004-now-let-s

## Overview

This guide provides step-by-step instructions for setting up and validating the email verification status sync feature. The feature allows users to sync email verification status from Supabase contacts to corresponding HubSpot contacts.

## Prerequisites

### System Requirements
- Node.js 18+ and npm/yarn
- Supabase project with contacts table
- HubSpot account with CRM access
- Valid HubSpot API key or OAuth setup

### Data Requirements
- Supabase `contacts` table with populated data
- At least some records with non-null `email_verification_status`
- Valid `hs_object_id` values that match existing HubSpot contacts
- HubSpot contacts with `email_verification_status` property configured

## Setup Instructions

### 1. Environment Configuration

Ensure your environment variables are properly configured:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# HubSpot Configuration
VITE_HUBSPOT_API_KEY=your_hubspot_api_key
# OR OAuth configuration
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
```

### 2. Database Preparation

Verify your Supabase contacts table has the required data:

```sql
-- Check for records eligible for sync
SELECT
  COUNT(*) as total_eligible,
  COUNT(CASE WHEN hs_object_id IS NOT NULL THEN 1 END) as with_hubspot_id,
  COUNT(DISTINCT email_verification_status) as unique_statuses
FROM contacts
WHERE email_verification_status IS NOT NULL;

-- Sample of eligible records
SELECT
  id,
  firstname,
  lastname,
  email,
  email_verification_status,
  hs_object_id,
  created_at
FROM contacts
WHERE email_verification_status IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### 3. HubSpot Property Configuration

Ensure the `email_verification_status` property exists in HubSpot:

1. Go to HubSpot Settings → Properties
2. Navigate to Contact Properties
3. Search for "email_verification_status"
4. Verify it's a dropdown property with appropriate options
5. Note the internal property name (should be "email_verification_status")

### 4. Application Setup

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

## Feature Usage

### 1. Access the Email Verification Sync Page

Navigate to the email verification sync page in your application. The URL should be:
```
http://localhost:5173/email-verification-sync
```

### 2. View Eligible Records

The page will display a table of Supabase contacts that have:
- Non-null `email_verification_status`
- Valid `hs_object_id` that matches HubSpot contacts

### 3. Initiate Sync Operations

For each record in the table:
1. Click the "Sync to HubSpot" button
2. Observe the status change to "Syncing..."
3. Wait for the operation to complete
4. Check the status indicator:
   - ✅ Green checkmark: Sync successful
   - ❌ Red X: Sync failed (hover for error details)
   - 🔄 Spinner: Operation in progress

### 4. Monitor Sync Results

- **Success**: HubSpot contact updated with new email verification status
- **Failure**: Error message displayed with details
- **Retry**: Failed operations can be retried by clicking the button again

## Validation Steps

### Automated Validation

Run the following checks to ensure everything is working:

#### 1. API Connectivity Test
```bash
# Test Supabase connection
curl -X GET "http://localhost:5173/api/email-verification-records" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: JSON response with records array
```

#### 2. HubSpot Integration Test
```bash
# Test HubSpot connection (via Netlify function)
curl -X POST "http://localhost:5173/.netlify/functions/hubspot-test" \
  -H "Content-Type: application/json"

# Expected: JSON response with connection status
```

#### 3. Sync Operation Test
```bash
# Test a sync operation
curl -X POST "http://localhost:5173/api/sync-email-verification" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supabaseContactId": 123,
    "hubspotContactId": "456",
    "emailVerificationStatus": "verified"
  }'

# Expected: JSON response with operation details
```

### Manual Validation

#### 1. Data Integrity Check
1. Select a Supabase contact with email verification status
2. Note the `hs_object_id` and current status
3. Perform sync operation
4. Verify in HubSpot that the contact's email verification status was updated
5. Confirm the status matches the Supabase value

#### 2. Error Handling Validation
1. Try syncing a record with invalid `hs_object_id`
2. Try syncing a record with invalid email verification status
3. Verify appropriate error messages are displayed
4. Confirm failed operations can be retried

#### 3. Performance Validation
1. Load page with many eligible records
2. Verify pagination works correctly
3. Test multiple sync operations simultaneously
4. Check for any performance degradation

## Troubleshooting

### Common Issues

#### Issue: No Records Displayed
**Symptoms**: Table shows "No records found" or empty table
**Solutions**:
1. Check Supabase connection and credentials
2. Verify records exist with non-null `email_verification_status`
3. Check browser console for API errors
4. Ensure CORS is properly configured

#### Issue: Sync Operations Fail
**Symptoms**: All sync attempts result in errors
**Solutions**:
1. Verify HubSpot API credentials
2. Check that `hs_object_id` values are valid HubSpot contact IDs
3. Ensure `email_verification_status` property exists in HubSpot
4. Check HubSpot API rate limits

#### Issue: Authentication Errors
**Symptoms**: 401 Unauthorized responses
**Solutions**:
1. Verify OAuth token is valid and not expired
2. Check API key configuration
3. Ensure proper authorization headers are sent
4. Confirm token has necessary HubSpot scopes

#### Issue: Network Errors
**Symptoms**: Connection timeouts or network failures
**Solutions**:
1. Check internet connectivity
2. Verify API endpoints are accessible
3. Check for firewall or proxy issues
4. Ensure Netlify functions are properly deployed

### Debug Mode

Enable debug logging for detailed error information:

```javascript
// In browser console
localStorage.setItem('debug', 'hubspot-sync:*');
```

This will provide detailed logs for:
- API request/response cycles
- Authentication flows
- Error handling details
- Performance metrics

## Performance Benchmarks

### Expected Performance
- **Page Load**: < 3 seconds for 100 records
- **Sync Operation**: < 5 seconds per operation
- **Concurrent Operations**: Support for 5+ simultaneous syncs
- **API Response Time**: < 2 seconds for data retrieval

### Monitoring
Monitor the following metrics:
- Sync success rate (> 95% expected)
- Average sync duration
- Error rate by error type
- API rate limit usage

## Next Steps

After successful setup and validation:

1. **Monitor Usage**: Track sync operations and success rates
2. **Gather Feedback**: Collect user feedback on the interface
3. **Optimize Performance**: Implement caching and batch operations if needed
4. **Add Features**: Consider bulk sync operations or automated scheduling
5. **Documentation**: Update user guides and API documentation

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Review server logs for API errors
3. Verify all prerequisites are met
4. Contact the development team with:
   - Error messages and stack traces
   - Steps to reproduce the issue
   - Environment details (browser, OS, etc.)
   - Sample data that demonstrates the problem