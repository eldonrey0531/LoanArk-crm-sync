# Quick Start: Email Verification Data Display

**Feature**: Email Verification Data Display
**Date**: September 17, 2025
**Target**: Frontend Developers

## Overview

This quick start guide provides the essential information needed to implement the Email Verification Data Display feature. The feature displays email verification data from Supabase and HubSpot in a side-by-side comparison format.

## Prerequisites

- Node.js 18+
- npm or bun package manager
- Access to Supabase database
- HubSpot API credentials
- Basic understanding of React and TypeScript

## Installation

```bash
# Install dependencies (if not already installed)
npm install @tanstack/react-query @radix-ui/react-select lucide-react

# For testing
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

## Basic Implementation

### 1. Create the Main Component

```typescript
// src/pages/EmailVerificationDataPage.tsx
import React from 'react';
import { EmailVerificationDataDisplay } from '../components/EmailVerificationDataDisplay';

export const EmailVerificationDataPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Verification Data</h1>
      <EmailVerificationDataDisplay
        initialPageSize={50}
        showFilters={true}
        onRecordSelect={(comparison) => {
          console.log('Selected record:', comparison);
        }}
      />
    </div>
  );
};
```

### 2. Create the Data Display Component

```typescript
// src/components/EmailVerificationDataDisplay.tsx
import React from 'react';
import { useEmailVerificationData } from '../hooks/useEmailVerificationData';
import { ComparisonTable } from './ComparisonTable';
import { FilterControls } from './FilterControls';
import { SummaryStats } from './SummaryStats';

export const EmailVerificationDataDisplay: React.FC = () => {
  const {
    data,
    loading,
    error,
    refetch,
    pagination,
    filters,
    setFilters
  } = useEmailVerificationData();

  return (
    <div className="space-y-6">
      <SummaryStats
        summary={data?.summary}
        totalRecords={data?.pagination.total}
      />

      <FilterControls
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ComparisonTable
        data={data?.contacts || []}
        loading={loading}
        error={error}
        pagination={data?.pagination}
        onPageChange={pagination.setPage}
        onRetry={refetch}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};
```

### 3. Create the Data Hook

```typescript
// src/hooks/useEmailVerificationData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchEmailVerificationComparison } from '../services/emailVerificationService';

export const useEmailVerificationData = (filters = {}) => {
  return useQuery({
    queryKey: ['email-verification-data', filters],
    queryFn: () => fetchEmailVerificationComparison(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 4. Create the Service Layer

```typescript
// src/services/emailVerificationService.ts
import { ApiEndpoints } from '../../specs/005-show-data-from/contracts/api-contracts';

export const fetchEmailVerificationComparison = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${ApiEndpoints.comparison.data}?${queryParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch comparison data');
  }

  return response.json();
};
```

## Component Structure

```
src/
├── components/
│   ├── EmailVerificationDataDisplay.tsx    # Main container
│   ├── ComparisonTable.tsx                 # Data table
│   ├── ComparisonRow.tsx                   # Individual row
│   ├── FilterControls.tsx                  # Filter UI
│   ├── SummaryStats.tsx                    # Statistics display
│   ├── StatusIndicator.tsx                 # Status badges
│   └── DataCell.tsx                        # Data cell component
├── hooks/
│   └── useEmailVerificationData.ts         # Data fetching hook
├── services/
│   └── emailVerificationService.ts         # API service layer
└── types/
    └── email-verification.ts               # Type definitions
```

## Key Features

### Side-by-Side Display
- Supabase data on the left (3 columns: Name, Email, Status)
- HubSpot data on the right (3 columns: Name, Email, Status)
- Visual indicators for matches/mismatches

### Filtering & Search
- Search by name or email
- Filter by match status (matched, unmatched, mismatches)
- Date range filtering (optional)

### Pagination
- Configurable page sizes (25, 50, 100, 200)
- Server-side pagination for performance
- Page navigation controls

### Responsive Design
- Mobile: Stacked layout
- Tablet/Desktop: Side-by-side layout
- Accessible keyboard navigation

## Testing

### Unit Tests

```typescript
// src/components/__tests__/EmailVerificationDataDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import { EmailVerificationDataDisplay } from '../EmailVerificationDataDisplay';

test('renders loading state', () => {
  render(<EmailVerificationDataDisplay />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('renders data table when loaded', async () => {
  // Mock data and render
  // Assert table renders correctly
});
```

### Integration Tests

```typescript
// src/hooks/__tests__/useEmailVerificationData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useEmailVerificationData } from '../useEmailVerificationData';

test('fetches data successfully', async () => {
  const { result } = renderHook(() => useEmailVerificationData());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

## API Integration

### Backend Requirements

The backend needs to provide a comparison endpoint that:

1. Fetches data from both Supabase and HubSpot
2. Matches records by `hs_object_id`
3. Returns structured comparison data
4. Handles pagination and filtering

### Example Backend Implementation

```javascript
// netlify/functions/email-verification-comparison.js
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Fetch Supabase data
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: supabaseData } = await supabase
      .from('contacts')
      .select('*')
      .not('email_verification_status', 'is', null);

    // Fetch HubSpot data
    const hubspotResponse = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
      headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}` },
      params: { properties: 'firstname,lastname,email,email_verification_status' }
    });

    // Compare and format data
    const comparison = compareData(supabaseData, hubspotResponse.data.results);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: comparison,
        pagination: { /* pagination info */ },
        summary: { /* summary stats */ }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
```

## Styling

### CSS Classes

```css
/* Main container */
.email-verification-display {
  @apply space-y-6;
}

/* Table styling */
.comparison-table {
  @apply w-full border-collapse;
}

.comparison-table th {
  @apply bg-gray-50 px-4 py-2 text-left font-medium text-gray-700;
}

.comparison-table td {
  @apply px-4 py-2 border-b border-gray-200;
}

/* Status indicators */
.status-matched {
  @apply bg-green-100 text-green-800;
}

.status-mismatch {
  @apply bg-red-100 text-red-800;
}

.status-supabase-only {
  @apply bg-blue-100 text-blue-800;
}

.status-hubspot-only {
  @apply bg-yellow-100 text-yellow-800;
}
```

## Performance Considerations

1. **Pagination**: Always use server-side pagination for large datasets
2. **Caching**: Cache API responses for 5-10 minutes
3. **Lazy Loading**: Load data only when needed
4. **Virtual Scrolling**: For tables with 1000+ rows

## Common Issues & Solutions

### Issue: Data not loading
**Solution**: Check API endpoints and authentication

### Issue: Mismatched records
**Solution**: Verify `hs_object_id` mapping between systems

### Issue: Performance problems
**Solution**: Implement pagination and caching

### Issue: Styling issues
**Solution**: Ensure Tailwind CSS is properly configured

## Next Steps

1. Implement the basic component structure
2. Add the data fetching hook
3. Create the service layer
4. Implement filtering and pagination
5. Add comprehensive tests
6. Optimize for performance

## Resources

- [React Query Documentation](https://tanstack.com/query)
- [Radix UI Components](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/crm/contacts)
- [Supabase Documentation](https://supabase.com/docs)

## Support

For questions or issues:
1. Check the component contracts in `contracts/component-contracts.ts`
2. Review the API contracts in `contracts/api-contracts.ts`
3. Look at existing similar components in the codebase
4. Create an issue in the project repository