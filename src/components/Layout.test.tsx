import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Layout from '@/components/Layout';

describe('Layout Component', () => {
  it('should render with default sidebar open', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('LoanArk CRM')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Latest Created')).toBeInTheDocument();
    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should toggle sidebar when menu button is clicked', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const menuButton = screen.getByRole('button');
    const sidebar = menuButton.closest('aside');

    // Initially sidebar should be open (w-64)
    expect(sidebar).toHaveClass('w-64');

    // Click to close sidebar
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('w-16');

    // Title should be hidden when collapsed
    expect(screen.queryByText('LoanArk CRM')).not.toBeInTheDocument();

    // Navigation text should be hidden
    expect(screen.queryByText('Latest Created')).not.toBeInTheDocument();
    expect(screen.queryByText('Sync Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Database')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Click to open sidebar again
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('w-64');
    expect(screen.getByText('LoanArk CRM')).toBeInTheDocument();
  });

  it('should render navigation links with correct icons', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check that navigation links exist
    const latestLink = screen.getByRole('link', { name: /latest created/i });
    const syncLink = screen.getByRole('link', { name: /sync status/i });
    const databaseLink = screen.getByRole('link', { name: /database/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(latestLink).toHaveAttribute('href', '/latest');
    expect(syncLink).toHaveAttribute('href', '/sync');
    expect(databaseLink).toHaveAttribute('href', '/database');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('should render children in main content area', () => {
    const testContent = 'Custom Test Content';
    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const menuButton = screen.getByRole('button');
    expect(menuButton).toHaveAttribute('aria-label');
  });

  it('should have responsive sidebar behavior', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const sidebar = screen.getByRole('complementary');
    const main = screen.getByRole('main');

    // Sidebar should have transition classes
    expect(sidebar).toHaveClass(
      'transition-all',
      'duration-300',
      'ease-in-out'
    );

    // Main content should be flexible
    expect(main).toHaveClass('flex-1', 'overflow-y-auto');
  });
});
