/// <reference types="vitest" />
import { render, screen } from '@testing-library/react';
import { ContactsTable } from '../ContactsTable';
import { HubSpotContact } from '../../types/hubspot';

const mockContacts: HubSpotContact[] = [
  {
    hs_object_id: '12345',
    email: 'john.doe@example.com',
    email_verification_status: 'verified',
    firstname: 'John',
    lastname: 'Doe',
    phone: '+1234567890',
    mobilephone: '+1234567891',
    client_type_vip_status: 'vip',
    client_type_prospects: 'hot',
    address: '123 Main St',
    city: 'Anytown',
    zip: '12345',
    createdate: '2023-01-01T00:00:00Z',
    lastmodifieddate: '2023-01-02T00:00:00Z',
  },
  {
    hs_object_id: '67890',
    email: 'jane.smith@example.com',
    email_verification_status: 'unverified',
    firstname: 'Jane',
    lastname: 'Smith',
    phone: '+0987654321',
    mobilephone: '+0987654322',
    client_type_vip_status: 'standard',
    client_type_prospects: 'warm',
    address: '456 Oak Ave',
    city: 'Somewhere',
    zip: '67890',
    createdate: '2023-01-02T00:00:00Z',
    lastmodifieddate: '2023-01-03T00:00:00Z',
  },
];

describe('ContactsTable', () => {
  it('renders table headers correctly', () => {
    render(<ContactsTable contacts={mockContacts} />);

    expect(screen.getByText('HubSpot ID')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last Modified')).toBeInTheDocument();
  });

  it('renders contact data correctly', () => {
    render(<ContactsTable contacts={mockContacts} />);

    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<ContactsTable contacts={[]} isLoading={true} />);

    expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(<ContactsTable contacts={[]} error='Failed to load contacts' />);

    expect(
      screen.getByText('Error loading contacts: Failed to load contacts')
    ).toBeInTheDocument();
  });

  it('displays empty state when no contacts', () => {
    render(<ContactsTable contacts={[]} />);

    expect(screen.getByText('No contacts found')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<ContactsTable contacts={mockContacts} />);

    // Should display formatted dates
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    expect(screen.getByText('1/2/2023')).toBeInTheDocument();
  });

  it('capitalizes status fields', () => {
    render(<ContactsTable contacts={mockContacts} />);

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Vip')).toBeInTheDocument();
    expect(screen.getByText('Hot')).toBeInTheDocument();
  });

  it('shows total count', () => {
    render(<ContactsTable contacts={mockContacts} />);

    expect(screen.getByText('Showing 2 of 2 contacts')).toBeInTheDocument();
  });
});
