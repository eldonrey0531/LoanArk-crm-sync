import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export * from '@testing-library/user-event';

// Override render method
export { customRender as render };

// Test utilities
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  return jest.fn(implementation);
};

export const waitForNextTick = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Mock data generators
export const createMockContact = (overrides = {}) => ({
  id: 'test-contact-id',
  email: 'test@example.com',
  firstname: 'John',
  lastname: 'Doe',
  phone: '+1234567890',
  company: 'Test Company',
  website: 'https://example.com',
  createdate: new Date().toISOString(),
  lastmodifieddate: new Date().toISOString(),
  ...overrides,
});

export const createMockSyncSession = (overrides = {}) => ({
  id: 'test-session-id',
  status: 'running',
  started_at: new Date().toISOString(),
  completed_at: null,
  total_contacts: 100,
  processed_contacts: 50,
  failed_contacts: 2,
  ...overrides,
});

export const createMockHubSpotConnection = (overrides = {}) => ({
  id: 'test-connection-id',
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: new Date(Date.now() + 3600000).toISOString(),
  token_type: 'bearer',
  ...overrides,
});

// Custom matchers
export const toHaveBeenCalledWithMatch = (
  mockFn: jest.MockedFunction<any>,
  expected: any
) => {
  const calls = mockFn.mock.calls;
  const hasMatch = calls.some(call =>
    JSON.stringify(call[0]).includes(JSON.stringify(expected))
  );

  return {
    pass: hasMatch,
    message: () =>
      `Expected mock function to have been called with object containing ${JSON.stringify(
        expected
      )}, but it was called with: ${calls.map(call => JSON.stringify(call[0])).join(', ')}`,
  };
};

// Performance testing utilities
export const measureRenderTime = async (component: ReactElement) => {
  const startTime = performance.now();
  const { container } = render(component);
  const endTime = performance.now();

  return {
    renderTime: endTime - startTime,
    container,
  };
};

// Accessibility testing helpers
export const expectToBeAccessible = (container: HTMLElement) => {
  // Check for common accessibility issues
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });

  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('aria-label');
  });

  const links = container.querySelectorAll('a');
  links.forEach(link => {
    expect(link).toHaveAttribute('href');
  });
};
