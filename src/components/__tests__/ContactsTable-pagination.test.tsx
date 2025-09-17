/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactsTable } from '../ContactsTable';
import { HubSpotContact } from '../../types/hubspot';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock data
const mockContacts: HubSpotContact[] = [
  {
    hs_object_id: '1',
    email: 'test1@example.com',
    firstname: 'John',
    lastname: 'Doe',
    createdate: '2023-01-01T00:00:00Z',
    lastmodifieddate: '2023-01-01T00:00:00Z',
  },
  {
    hs_object_id: '2',
    email: 'test2@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    createdate: '2023-01-02T00:00:00Z',
    lastmodifieddate: '2023-01-02T00:00:00Z',
  },
];

describe('ContactsTable - Current Pagination Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render contacts table with data', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Component should render contacts
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('should show pagination controls', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Should have pagination buttons
    expect(
      screen.getByRole('button', { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(<ContactsTable contacts={mockContacts} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should show contact count information', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Should show how many contacts are displayed
    expect(screen.getByText('Showing 2 of 2 contacts')).toBeInTheDocument();
  });

  it('should handle empty contacts array', () => {
    render(<ContactsTable contacts={[]} />);

    expect(screen.getByText('No contacts found')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<ContactsTable contacts={[]} isLoading={true} />);

    expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ContactsTable contacts={[]} error='Failed to load contacts' />);

    expect(
      screen.getByText('Error loading contacts: Failed to load contacts')
    ).toBeInTheDocument();
  });

  it('should support column sorting', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Should have sortable column headers
    const emailHeader = screen.getByRole('button', { name: /email/i });
    expect(emailHeader).toBeInTheDocument();

    // Clicking should trigger sorting (visual indicator may change)
    fireEvent.click(emailHeader);
    // Test passes if no error occurs
  });

  it('should display all required columns', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Check for key columns
    expect(screen.getByText('HubSpot ID')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Modified')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Should show formatted dates
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const contactWithMissingFields: HubSpotContact = {
      hs_object_id: '3',
      email: 'test3@example.com',
      createdate: '2023-01-03T00:00:00Z',
      lastmodifieddate: '2023-01-03T00:00:00Z',
      // Missing firstname, lastname, etc.
    };

    render(<ContactsTable contacts={[contactWithMissingFields]} />);

    // Should render without crashing
    expect(screen.getByText('test3@example.com')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

// TODO: Update these tests once manual pagination props are implemented
describe('ContactsTable - Manual Pagination Props (Future Implementation)', () => {
  it('should accept manual pagination props interface', () => {
    const mockOnPageChange = vi.fn();
    const mockOnPageSizeChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 1,
          totalPages: 5,
          pageSize: 25,
          totalItems: 100,
          onPageChange: mockOnPageChange,
          onPageSizeChange: mockOnPageSizeChange,
        }}
      />
    );

    // Component should render without crashing
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
  });

  it('should display pagination information from manual props', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 2,
          totalPages: 10,
          pageSize: 25,
          totalItems: 250,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    // Should show current page and total pages
    expect(
      screen.getByText('Page 2 of 10 (250 total contacts)')
    ).toBeInTheDocument();
  });

  it('should call onPageChange when next button is clicked', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 1,
          totalPages: 5,
          pageSize: 25,
          totalItems: 100,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when previous button is clicked', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 3,
          totalPages: 5,
          pageSize: 25,
          totalItems: 100,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 1,
          totalPages: 5,
          pageSize: 25,
          totalItems: 100,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 5,
          totalPages: 5,
          pageSize: 25,
          totalItems: 100,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should handle empty contacts array with manual pagination', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={[]}
        manualPagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: 25,
          totalItems: 0,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    expect(screen.getByText('No contacts found')).toBeInTheDocument();
    expect(
      screen.getByText('Page 1 of 1 (0 total contacts)')
    ).toBeInTheDocument();
  });

  it('should maintain sorting functionality with manual pagination', () => {
    const mockOnPageChange = vi.fn();

    render(
      <ContactsTable
        contacts={mockContacts}
        manualPagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: 25,
          totalItems: 2,
          onPageChange: mockOnPageChange,
        }}
      />
    );

    // Should still have sortable headers
    const emailHeader = screen.getByRole('button', { name: /email/i });
    expect(emailHeader).toBeInTheDocument();

    // Sorting should still work (though it will be client-side for current page data)
    fireEvent.click(emailHeader);
    // Test passes if no error occurs
  });

  it('should handle loading state with manual pagination', () => {
    render(
      <ContactsTable
        contacts={[]}
        isLoading={true}
        manualPagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: 25,
          totalItems: 0,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
  });

  it('should handle error state with manual pagination', () => {
    render(
      <ContactsTable
        contacts={[]}
        error='Failed to load contacts'
        manualPagination={{
          currentPage: 1,
          totalPages: 1,
          pageSize: 25,
          totalItems: 0,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(
      screen.getByText('Error loading contacts: Failed to load contacts')
    ).toBeInTheDocument();
  });
});
