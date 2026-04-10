import { test, expect } from '@playwright/test';

async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('your@email.com').fill('demo@graphify.com');
  await page.getByPlaceholder('Enter your password').fill('demo123');
  await page.getByRole('button', { name: /sign in to graphify/i }).click();
  await page.waitForURL('/dashboard');
}

test.describe('UI - Graph Explorer Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
    await page.goto('/graphs');
  });

  test('UI-10: Graph explorer page loads with 3-panel layout', async ({ page }) => {
    await page.goto('/graphs');
    await expect(page).toHaveURL('/graphs');

    await expect(page.getByText('Relationship workspace')).toBeVisible();
  });

  test('UI-11: NodesList panel is visible (left)', async ({ page }) => {
    await page.goto('/graphs');

    const nodesList = page.getByRole('region', { name: 'Nodes List' });
    await expect(nodesList).toBeVisible();
  });

  test('UI-12: GraphCanvas (3D visualization) is visible', async ({ page }) => {
    await page.goto('/graphs');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('UI-13: PropertiesPanel (right) is visible', async ({ page }) => {
    await page.goto('/graphs');

    await expect(page.getByText('Select a node to inspect', { exact: true })).toBeVisible();
  });

  test('UI-14: Graphs link is active in sidebar', async ({ page }) => {
    await page.goto('/graphs');

    const graphsLink = page.getByRole('link', { name: 'Graphs' }).first();
    const isActive = await graphsLink.evaluate((el) =>
      el.className.includes('active') || el.getAttribute('aria-current') === 'page',
    );

    expect(isActive).toBeTruthy();
  });

  test('UI-15: NodesList search filter works', async ({ page }) => {
    await page.goto('/graphs');

    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="filter" i]').first();

    await expect(searchInput).toBeVisible();
    await searchInput.fill('Product');
    await expect(page.getByText('Product', { exact: true })).toBeVisible();
  });
});
