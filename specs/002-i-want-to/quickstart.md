# Quickstart: Add HubSpot Database and Contacts Pages

## Overview

This feature adds two new pages to the LoanArk CRM Sync application:
- **HubSpot Database Page**: Displays contacts synchronized to the local database
- **HubSpot Contacts Page**: Displays live contacts from HubSpot CRM

Both pages show contact data in table format with the following properties:
- hs_object_id, email, email_verification_status, firstname, lastname
- phone, mobilephone, client_type_vip_status, client_type_prospects
- address, city, zip, createdate, lastmodifieddate

## Prerequisites

1. **HubSpot Connection**: Ensure HubSpot is connected via OAuth
2. **Data Synchronization**: Run initial sync to populate database contacts
3. **Environment**: Development or staging environment with valid API keys

## Testing the Feature

### 1. Access the Application

```bash
npm run dev
```

Navigate to `http://localhost:5173`

### 2. Navigate to HubSpot Database Page

1. Log in to the application
2. Navigate to the "HubSpot Database" page (new menu item)
3. Verify the page loads within 2 seconds
4. Check that the table displays contacts with all required columns
5. Test sorting by clicking column headers
6. Test pagination if more than 50 contacts

**Expected Results**:
- Table shows contacts from synced database
- All 13 columns are present and populated
- No console errors
- Responsive design on mobile devices

### 3. Navigate to HubSpot Contacts Page

1. Navigate to the "HubSpot Contacts" page
2. Verify the page loads (may take longer due to API call)
3. Check that the table displays live contacts with all required properties
4. Verify data matches HubSpot CRM dashboard

**Expected Results**:
- Table shows live contacts from HubSpot API
- Data is current (not cached)
- Error handling for API failures
- Loading states during data fetch

### 4. Error Scenarios

1. **No HubSpot Connection**:
   - Navigate to either page
   - Should show appropriate error message
   - Provide link to reconnect HubSpot

2. **Empty Data**:
   - If no contacts exist
   - Should show "No contacts found" message
   - Not show empty table

3. **API Rate Limit**:
   - Trigger multiple rapid requests
   - Should handle 429 errors gracefully
   - Show user-friendly error message

## Validation Checklist

- [ ] HubSpot Database page loads successfully
- [ ] All 13 columns display correctly
- [ ] Data matches synced database
- [ ] HubSpot Contacts page loads successfully
- [ ] Live data matches HubSpot CRM
- [ ] Error handling works for connection issues
- [ ] Mobile responsive design
- [ ] Performance < 2 seconds load time
- [ ] Accessibility compliant (WCAG 2.1 AA)

## Troubleshooting

### Common Issues

1. **Blank Pages**: Check HubSpot OAuth connection
2. **Slow Loading**: Verify API keys and network connectivity
3. **Missing Data**: Ensure data synchronization has run
4. **Console Errors**: Check browser developer tools for API errors

### Debug Commands

```bash
# Check HubSpot connection
curl -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"

# Check database sync status
npm run db:status
```

## Performance Benchmarks

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 1 second
- **Table Render Time**: < 500ms for 100 contacts
- **Memory Usage**: < 50MB for typical usage