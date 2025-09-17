import { test, expect } from '@playwright/test';

test.describe('LoanArk CRM Sync Application', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment variables
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_SUPABASE_URL', 'http://localhost:3000');
      window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    });
  });

  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the main layout is rendered
    await expect(page).toHaveTitle(/LoanArk CRM/);

    // Check for main navigation elements
    await expect(page.locator('text=LoanArk CRM')).toBeVisible();
    await expect(page.locator('text=Latest Created')).toBeVisible();
    await expect(page.locator('text=Sync Status')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    await page.goto('/');

    // Sidebar should be open by default
    await expect(page.locator('text=LoanArk CRM')).toBeVisible();

    // Click the menu toggle button
    await page.locator('button').first().click();

    // Sidebar should collapse
    await expect(page.locator('text=LoanArk CRM')).not.toBeVisible();

    // Click again to expand
    await page.locator('button').first().click();
    await expect(page.locator('text=LoanArk CRM')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Click on Latest Created link
    await page.locator('text=Latest Created').click();

    // Should navigate to latest page
    await expect(page).toHaveURL(/.*latest/);

    // Click on Sync Status link
    await page.locator('text=Sync Status').click();

    // Should navigate to sync page
    await expect(page).toHaveURL(/.*sync/);
  });

  test('should handle responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // On mobile, sidebar should be collapsed by default
    await expect(page.locator('text=LoanArk CRM')).not.toBeVisible();

    // Toggle should still work
    await page.locator('button').first().click();
    await expect(page.locator('text=LoanArk CRM')).toBeVisible();
  });

  test('should display error boundary for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');

    // Should show 404 or error page
    await expect(page.locator('text=Not Found')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());

    await page.goto('/');

    // Should show error message or fallback UI
    await expect(page.locator('text=Error')).toBeVisible();
  });
});
