// src/__tests__/contracts/components/test-comparison-row.ts

/**
 * Contract Tests for ComparisonRow Component
 *
 * Based on contracts/component-contracts.ts - ComparisonRowProps
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ComparisonRowProps } from '../../../../specs/005-show-data-from/contracts/component-contracts';

const mockComparison = {
  id: 'comparison-1',
  supabase: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    email_verification_status: 'verified',
    hs_object_id: '12345',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  },
  hubspot: {
    id: '12345',
    properties: {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      email_verification_status: 'verified',
      hs_object_id: '12345',
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  match_status: 'matched' as const,
  differences: [],
  last_sync: '2025-01-15T10:30:00Z',
};

const mockComparisonRow = (props: ComparisonRowProps) => {
  return React.createElement(
    'div',
    {
      'data-testid': 'comparison-row',
      ...props,
    },
    'Mock Comparison Row'
  );
};

describe('ComparisonRow Component Contract', () => {
  const defaultProps: ComparisonRowProps = {
    comparison: mockComparison,
  };

  it('should accept required comparison prop', () => {
    expect(() => {
      render(mockComparisonRow(defaultProps));
    }).not.toThrow();
  });

  it('should accept optional configuration props', () => {
    const props: ComparisonRowProps = {
      ...defaultProps,
      selectable: true,
      showDifferences: true,
      highlightMismatches: true,
      className: 'custom-row',
    };

    expect(() => {
      render(mockComparisonRow(props));
    }).not.toThrow();
  });

  it('should accept callback props', () => {
    const mockOnSelect = vi.fn();
    const mockOnClick = vi.fn();

    const props: ComparisonRowProps = {
      ...defaultProps,
      onSelect: mockOnSelect,
      onClick: mockOnClick,
    };

    expect(() => {
      render(mockComparisonRow(props));
    }).not.toThrow();
  });

  it('should display comparison data correctly', () => {
    render(mockComparisonRow(defaultProps));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should handle selection when selectable', async () => {
    const mockOnSelect = vi.fn();
    const user = userEvent.setup();

    const props: ComparisonRowProps = {
      ...defaultProps,
      selectable: true,
      onSelect: mockOnSelect,
    };

    render(mockComparisonRow(props));

    const row = screen.getByTestId('comparison-row');
    await user.click(row);

    expect(mockOnSelect).toHaveBeenCalledWith(mockComparison);
  });
});
