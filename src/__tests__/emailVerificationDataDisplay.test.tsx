// src/__tests__/emailVerificationDataDisplay.test.tsx

/**
 * Email Verification Data Display Tests
 *
 * Basic tests to validate the Email Verification Data Display implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmailVerificationDataDisplay } from '@/components/EmailVerificationDataDisplay';

// Mock the API service
vi.mock('@/services/comparisonApiService', () => ({
  comparisonApiService: {
    fetchComparison: vi.fn().mockResolvedValue({
      data: [],
      summary: {
        total_matched: 0,
        total_supabase_only: 0,
        total_hubspot_only: 0,
        total_mismatches: 0
      },
      pagination: {
        page: 1,
        page_size: 25,
        total: 0,
        has_next: false,
        has_previous: false
      }
    })
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('EmailVerificationDataDisplay', () => {
  it('renders without crashing', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <EmailVerificationDataDisplay />
      </QueryClientProvider>
    );

    expect(screen.getByText('Email Verification Data Display')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <EmailVerificationDataDisplay />
      </QueryClientProvider>
    );

    // Should show loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});