# Quick Start Guide: Email Verification Sync Data Display

**Feature**: `006-in-email-verification`
**Date**: September 17, 2025
**Status**: Ready for Development

## 🚀 Quick Start Overview

This feature creates a side-by-side data display for email verification records, showing Supabase data on the left and HubSpot data on the right, with exactly 3 columns: name, hs_object_id, and email_verification_status.

## 🎯 Feature in 30 Seconds

**What it does:**
- Displays contact records that have email verification status entries
- Shows Supabase and HubSpot data side-by-side
- Focuses on 3 key columns: name, hs_object_id, email_verification_status

**Who it's for:**
- Users who need to manage and compare email verification data
- Administrators monitoring data synchronization between systems
- Support teams troubleshooting email verification issues

## 📋 Prerequisites

### Technical Requirements
- ✅ Node.js 18+ and npm
- ✅ Supabase project with contacts table
- ✅ HubSpot CRM API access
- ✅ Existing authentication system

### Data Requirements
- ✅ Contacts table with `email_verification_status` column
- ✅ `hs_object_id` field linking to HubSpot contacts
- ✅ Basic contact information (name, email)

## 🛠️ Implementation Steps

### Step 1: API Development (2-3 hours)
```bash
# Create new API endpoint for email verification records
# File: netlify/functions/email-verification-sync.js
```

**Key Implementation:**
- Query Supabase for records where `email_verification_status IS NOT NULL`
- Fetch corresponding HubSpot contact data
- Return combined dataset for side-by-side display

### Step 2: Component Creation (3-4 hours)
```typescript
// Create main display component
// File: src/pages/EmailVerificationSyncPage.tsx
// File: src/components/EmailVerificationSyncDisplay.tsx
```

**Key Implementation:**
- Side-by-side layout (Supabase left, HubSpot right)
- Exactly 3 columns: name, hs_object_id, email_verification_status
- Responsive design for mobile/tablet

### Step 3: Integration (1-2 hours)
```typescript
// Add to routing system
// File: src/App.tsx (add route)
// File: src/components/Layout.tsx (add navigation)
```

## 🔧 Code Snippets

### API Endpoint Structure
```javascript
// netlify/functions/email-verification-sync.js
exports.handler = async (event, context) => {
  try {
    // 1. Fetch Supabase records with email verification status
    const supabaseRecords = await fetchSupabaseRecords();

    // 2. Extract HubSpot IDs
    const hubspotIds = supabaseRecords.map(record => record.hs_object_id);

    // 3. Fetch HubSpot contact data
    const hubspotRecords = await fetchHubSpotRecords(hubspotIds);

    // 4. Return combined data
    return {
      statusCode: 200,
      body: JSON.stringify({
        supabaseRecords,
        hubspotRecords,
        matchedRecords: matchRecords(supabaseRecords, hubspotRecords)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### Component Structure
```typescript
// src/components/EmailVerificationSyncDisplay.tsx
export const EmailVerificationSyncDisplay: React.FC = () => {
  const { data, loading, error } = useEmailVerificationSync();

  if (loading) return <LoadingState />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Supabase Data (Left Side) */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.supabaseRecords}
            columns={['name', 'hs_object_id', 'email_verification_status']}
          />
        </CardContent>
      </Card>

      {/* HubSpot Data (Right Side) */}
      <Card>
        <CardHeader>
          <CardTitle>HubSpot Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.hubspotRecords}
            columns={['name', 'hs_object_id', 'email_verification_status']}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🎨 UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ Email Verification Sync Data Display                       │
├─────────────────────────┬───────────────────────────────────┤
│      Supabase           │         HubSpot                   │
├─────────────────────────┼───────────────────────────────────┤
│ Name │ HS ID │ Status   │ Name │ HS ID │ Status            │
├─────────────────────────┼───────────────────────────────────┤
│ John Doe │ 12345 │ Verified │ John Doe │ 12345 │ Verified  │
│ Jane Smith │ 67890 │ Pending │ Jane Smith │ 67890 │ Pending │
│ Bob Wilson │ 11111 │ Failed │ Bob Wilson │ 11111 │ Failed   │
└─────────────────────────┴───────────────────────────────────┘
```

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Only records with `email_verification_status` entries are displayed
- [ ] Supabase data appears on the left side
- [ ] HubSpot data appears on the right side
- [ ] Exactly 3 columns are shown
- [ ] Data loads within 2 seconds
- [ ] Responsive design works on all devices

### Technical Requirements
- [ ] TypeScript compilation passes
- [ ] ESLint rules pass
- [ ] Unit tests cover >80% of code
- [ ] API endpoints handle errors gracefully
- [ ] Loading states are user-friendly

## 🧪 Testing Checklist

### Manual Testing
- [ ] Page loads without errors
- [ ] Data displays correctly in both columns
- [ ] Only records with email verification status appear
- [ ] Responsive design works on mobile/tablet
- [ ] Error states display appropriate messages

### Automated Testing
- [ ] API endpoint tests pass
- [ ] Component rendering tests pass
- [ ] Data transformation tests pass
- [ ] Error handling tests pass

## 🚀 Deployment Steps

### Development Environment
```bash
# 1. Start development server
npm run dev

# 2. Test the feature locally
# Navigate to /email-verification-sync

# 3. Verify data loading and display
```

### Production Deployment
```bash
# 1. Build for production
npm run build

# 2. Deploy to Netlify
npm run deploy

# 3. Verify production functionality
```

## 🔍 Troubleshooting

### Common Issues

**No data displayed:**
- Check if `email_verification_status` column has entries
- Verify HubSpot API credentials
- Check network connectivity

**Layout issues:**
- Ensure CSS grid classes are properly loaded
- Check responsive breakpoints
- Verify Tailwind CSS configuration

**Performance issues:**
- Implement pagination for large datasets
- Add loading states for better UX
- Optimize API calls with caching

## 📞 Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [HubSpot API Documentation](https://developers.hubspot.com/docs/api)
- [React Query Documentation](https://react-query.tanstack.com)

### Related Files
- `src/services/supabaseApiService.ts` - Supabase data fetching
- `src/services/hubspotApiService.ts` - HubSpot data fetching
- `src/components/ComparisonTable.tsx` - Existing table component reference

## 🎯 Next Steps

1. **Start Development**: Begin with API endpoint creation
2. **Build Components**: Implement the side-by-side display
3. **Add Features**: Implement filtering and sorting
4. **Test Thoroughly**: Ensure all acceptance criteria are met
5. **Deploy**: Move to production environment

---

*This quick start guide provides the essential information needed to begin development. Refer to the detailed plan.md and research.md for comprehensive implementation details.*