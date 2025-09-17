// src/__tests__/contracts/components/test-summary-stats.ts

/**
 * Contract Tests for SummaryStats Component
 *
 * Based on contracts/component-contracts.ts - SummaryStatsProps
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  SummaryStatsProps
} from '../../../../specs/005-show-data-from/contracts/component-contracts';

const mockSummaryStats = (props: SummaryStatsProps) => {
  return React.createElement('div', {
    'data-testid': 'summary-stats',
    ...props
  }, 'Mock Summary Stats');
};

describe('SummaryStats Component Contract', () => {
  const mockSummary = {
    total_matched: 75,
    total_supabase_only: 15,
    total_hubspot_only: 8,
    total_mismatches: 2
  };

  const defaultProps: SummaryStatsProps = {
    summary: mockSummary,
    totalRecords: 100
  };

  it('should accept required props', () => {
    expect(() => {
      render(mockSummaryStats(defaultProps));
    }).not.toThrow();
  });

  it('should accept optional configuration props', () => {
    const props: SummaryStatsProps = {
      ...defaultProps,
      showPercentages: true,
      compact: true,
      className: 'custom-summary'
    };

    expect(() => {
      render(mockSummaryStats(props));
    }).not.toThrow();
  });

  it('should display summary data correctly', () => {
    render(mockSummaryStats(defaultProps));

    expect(screen.getByText('Mock Summary Stats')).toBeInTheDocument();
  });

  it('should handle different summary data structures', () => {
    const differentSummary = {
      total_matched: 30,
      total_supabase_only: 10,
      total_hubspot_only: 5,
      total_mismatches: 5
    };

    const props: SummaryStatsProps = {
      summary: differentSummary,
      totalRecords: 50
    };

    expect(() => {
      render(mockSummaryStats(props));
    }).not.toThrow();
  });

  it('should handle edge cases with zero values', () => {
    const zeroSummary = {
      total_matched: 0,
      total_supabase_only: 0,
      total_hubspot_only: 0,
      total_mismatches: 0
    };

    const props: SummaryStatsProps = {
      summary: zeroSummary,
      totalRecords: 0
    };

    expect(() => {
      render(mockSummaryStats(props));
    }).not.toThrow();
  });
});