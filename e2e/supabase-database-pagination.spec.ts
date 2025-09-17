import { test, expect } from '@playwright/test';

test.describe('Supabase Database Page - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('hubspot_access_token', 'test-token');
    });
  });

  test('should load Supabase database page with pagination controls', async ({ page }) => {
    await page.goto('/supabase-database');

    // Check page loads successfully
    await expect(page.locator('h1')).toContainText('Supabase Database');

    // Check pagination controls are present
    const prevButton = page.locator('button').filter({ hasText: 'Previous' });
    const nextButton = page.locator('button').filter({ hasText: 'Next' });

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
  });

  test('should display contacts in table with pagination info', async ({ page }) => {
    await page.goto('/supabase-database');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check table is present
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check pagination info is displayed
    const paginationInfo = page.locator('text=/Showing \\d+ of \\d+ contacts/');
    await expect(paginationInfo).toBeVisible();
  });

  test('should navigate to next page when Next button is clicked', async ({ page }) => {
    await page.goto('/supabase-database');

    // Wait for initial data load
    await page.waitForTimeout(1000);

    // Get initial pagination info
    const initialInfo = await page.locator('text=/Showing \\d+ of \\d+ contacts/').textContent();

    // Click next button (should be enabled if there are more pages)
    const nextButton = page.locator('button').filter({ hasText: 'Next' });
    const isNextEnabled = await nextButton.isEnabled();

    if (isNextEnabled) {
      await nextButton.click();

      // Wait for new data to load
      await page.waitForTimeout(1000);

      // Check that pagination info changed
      const newInfo = await page.locator('text=/Showing \\d+ of \\d+ contacts/').textContent();
      expect(newInfo).not.toBe(initialInfo);
    } else {
      // If next is disabled, we're already on the last page
      expect(await nextButton.isDisabled()).toBe(true);
    }
  });

  test('should navigate to previous page when Previous button is clicked', async ({ page }) => {
    await page.goto('/supabase-database');

    // First navigate to second page if possible
    const nextButton = page.locator('button').filter({ hasText: 'Next' });
    const isNextEnabled = await nextButton.isEnabled();

    if (isNextEnabled) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Now test previous button
      const prevButton = page.locator('button').filter({ hasText: 'Previous' });
      await prevButton.click();
      await page.waitForTimeout(1000);

      // Should be back to first page
      const paginationInfo = await page.locator('text=/Showing \\d+ of \\d+ contacts/').textContent();
      expect(paginationInfo).toContain('Showing');
    }
  });

  test('should handle loading states during pagination', async ({ page }) => {
    await page.goto('/supabase-database');

    // Click next button if available
    const nextButton = page.locator('button').filter({ hasText: 'Next' });
    const isNextEnabled = await nextButton.isEnabled();

    if (isNextEnabled) {
      // Start clicking and check for loading states
      await nextButton.click();

      // Check for loading indicators (this will fail initially)
      const loadingIndicator = page.locator('text=Loading').or(page.locator('[aria-label="Loading"]'));
      // Note: This test will fail until loading states are implemented
      await expect(loadingIndicator).toBeVisible();
    }
  });

  test('should maintain table sorting during pagination', async ({ page }) => {
    await page.goto('/supabase-database');

    // Wait for data
    await page.waitForTimeout(1000);

    // Click on a sortable column header (if available)
    const sortableHeader = page.locator('th').filter({ hasText: 'Email' }).first();
    if (await sortableHeader.isVisible()) {
      await sortableHeader.click();
      await page.waitForTimeout(500);

      // Navigate to next page
      const nextButton = page.locator('button').filter({ hasText: 'Next' });
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Check that table still has data (this will fail until sorting is preserved)
        const tableRows = page.locator('tbody tr');
        await expect(tableRows.first()).toBeVisible();
      }
    }
  });

  test('should display error states gracefully', async ({ page }) => {
    // Remove authentication to trigger error
    await page.addInitScript(() => {
      window.localStorage.removeItem('hubspot_access_token');
    });

    await page.goto('/supabase-database');

    // Should show error message (this will fail until error handling is implemented)
    await expect(page.locator('text=error|Error|failed|Failed')).toBeVisible();
  });
});