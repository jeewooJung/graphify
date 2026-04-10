import { test, expect } from '@playwright/test';

async function loginAsDemoUser(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('your@email.com').fill('demo@graphify.com');
  await page.getByPlaceholder('Enter your password').fill('demo123');
  await page.getByRole('button', { name: /sign in to graphify/i }).click();
  await page.waitForURL('/dashboard');
}

test.describe('UI - Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test('UI-01: Root path redirects to /dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('UI-02: Dashboard page loads successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('UI-03: Statistics cards are displayed', async ({ page }) => {
    await page.goto('/dashboard');

    const statLabels = ['Active graphs', 'Reviewers online', 'Connected nodes', 'Schema health'];
    for (const label of statLabels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('UI-04: Recent Graphs section is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const recentGraphsSection = page.getByText(/Recent graphs/i);
    await expect(recentGraphsSection).toBeVisible();
  });

  test('UI-05: Team Activity section is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const activitySection = page.getByText(/Team activity/i);
    await expect(activitySection).toBeVisible();
  });

  test('UI-06: Sidebar navigation menu is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const navLinks = ['Dashboard', 'Graphs', 'Search', 'Team', 'Projects', 'Permissions'];
    for (const link of navLinks) {
      const navItem = page.getByRole('link', { name: link }).first();
      await expect(navItem).toBeVisible();
    }
  });

  test('UI-07: Current page is highlighted in navigation', async ({ page }) => {
    await page.goto('/dashboard');

    const dashboardLink = page.getByRole('link', { name: 'Dashboard' }).first();
    const activeClass = await dashboardLink.evaluate((el) =>
      el.className.includes('active') || el.getAttribute('aria-current') === 'page',
    );

    expect(activeClass).toBeTruthy();
  });

  test('UI-08: Header search input is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const searchButton = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await expect(searchButton).toBeVisible();
  });

  test('UI-09: Mobile layout (375px width) shows hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    const buttons = page.locator('header button');
    await expect(buttons.first()).toBeVisible();
  });
});
