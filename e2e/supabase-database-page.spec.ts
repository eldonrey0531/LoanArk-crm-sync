import { test, expect } from '@playwright/test';

test.describe('Supabase Database Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment variables
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_SUPABASE_URL', 'http://localhost:3000');
      window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
      // Mock HubSpot authentication
      window.localStorage.setItem('hubspot_access_token', 'test-token');
    });
  });

  test('should load Supabase database page successfully', async ({ page }) => {
    await page.goto('/supabase-database');

    // Check page title or heading
    await expect(
      page.locator('h1, h2').filter({ hasText: /database|contacts/i })
    ).toBeVisible();

    // Check that table is present
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(
      page.locator('th').filter({ hasText: 'hs_object_id' })
    ).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'email' })).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'firstname' })
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'lastname' })
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'createdate' })
    ).toBeVisible();
    await expect(
      page.locator('th').filter({ hasText: 'lastmodifieddate' })
    ).toBeVisible();
  });

  test('should display contacts data in table', async ({ page }) => {
    await page.goto('/supabase-database');

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check if table has rows (tbody tr)
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Check first row has required data
      const firstRow = rows.first();
      await expect(firstRow.locator('td').nth(0)).not.toBeEmpty(); // hs_object_id
      await expect(firstRow.locator('td').nth(1)).toHaveAttribute(
        'type',
        'email'
      ); // email
    } else {
      // No data message
      await expect(page.locator('text=No contacts found')).toBeVisible();
    }
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('/supabase-database');

    // Check for loading indicator initially
    const loadingIndicator = page
      .locator('text=Loading')
      .or(page.locator('[aria-label="Loading"]'));
    await expect(loadingIndicator).toBeVisible();

    // Wait for loading to complete
    await loadingIndicator.waitFor({ state: 'hidden' });
  });

  test('should handle error states', async ({ page }) => {
    // Remove authentication to trigger error
    await page.addInitScript(() => {
      window.localStorage.removeItem('hubspot_access_token');
    });

    await page.goto('/supabase-database');

    // Should show error message
    await expect(page.locator('text=error|Error|failed|Failed')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/supabase-database');

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();

    // Check table has proper accessibility attributes
    const table = page.locator('table');
    await expect(table).toHaveAttribute('role', 'table');
  });
});
