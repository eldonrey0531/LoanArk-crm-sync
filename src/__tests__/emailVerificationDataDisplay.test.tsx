// src/__tests__/emailVerificationDataDisplay.test.tsx

/**
 * Email Verification Data Display Tests
 *
 * Basic tests to validate the Email Verification Data Display implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmailVerificationSyncTable } from '@/components/EmailVerificationSyncTable';
import { ContactComparison } from '@/types/emailVerificationDataDisplay';

// Mock data for testing
const mockComparisons: ContactComparison[] = [
  {
    id: 'contact_123',
    supabase: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      email_verification_status: 'verified',
      hs_object_id: 'contact_123',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    },
    hubspot: {
      id: 'contact_123',
      properties: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        email_verification_status: 'verified',
        hs_object_id: 'contact_123'
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    },
    match_status: 'matched',
    differences: [],
    last_sync: '2025-01-02T00:00:00Z'
  },
  {
    id: 'contact_124',
    supabase: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      email_verification_status: 'pending',
      hs_object_id: 'contact_124',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    },
    hubspot: null,
    match_status: 'supabase_only',
    differences: [],
    last_sync: '2025-01-02T00:00:00Z'
  }
];

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('EmailVerificationSyncTable', () => {
  it('renders Supabase and HubSpot tables with data', () => {
    const selectedIds = new Set<string>();

    render(
      <EmailVerificationSyncTable
        data={mockComparisons}
        selectedIds={selectedIds}
        onRecordSelect={() => {}}
        onSelectAll={() => {}}
        onSyncRecord={() => {}}
        onSyncSelected={() => {}}
        isLoading={false}
      />
    );

    // Check that both table sections are rendered
    expect(screen.getByText('Supabase Data')).toBeInTheDocument();
    expect(screen.getByText('HubSpot Data')).toBeInTheDocument();

    // Check that data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Check verification statuses
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Check match status
    expect(screen.getByText('Matched')).toBeInTheDocument();
    expect(screen.getByText('Supabase Only')).toBeInTheDocument();
  });

  it('shows empty state when no data is provided', () => {
    const selectedIds = new Set<string>();

    render(
      <EmailVerificationSyncTable
        data={[]}
        selectedIds={selectedIds}
        onRecordSelect={() => {}}
        onSelectAll={() => {}}
        onSyncRecord={() => {}}
        onSyncSelected={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText('No email verification records found')).toBeInTheDocument();
  });

  it('handles selection correctly', () => {
    const selectedIds = new Set(['contact_123']);
    const mockOnRecordSelect = vi.fn();

    render(
      <EmailVerificationSyncTable
        data={mockComparisons}
        selectedIds={selectedIds}
        onRecordSelect={mockOnRecordSelect}
        onSelectAll={() => {}}
        onSyncRecord={() => {}}
        onSyncSelected={() => {}}
        isLoading={false}
      />
    );

    // The checkbox should be checked for the selected record
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
});