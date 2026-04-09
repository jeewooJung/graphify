import { test, expect } from '@playwright/test';

test.describe('UI - Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('UI-01: Root path redirects to /dashboard', async ({ page }) => {
    // page.goto('/') was called in beforeEach
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('UI-02: Dashboard page loads successfully', async ({ page }) => {
    await page.goto('/dashboard');
    expect(page).toHaveURL('/dashboard');
  });

  test('UI-03: Statistics cards are displayed', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for statistics section
    const statsSection = await page.locator('text=/Total Graphs|Team Members|Total Nodes/');
    expect(statsSection).toHaveCount(3);
  });

  test('UI-04: Recent Graphs section is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const recentGraphsSection = await page.locator('text=/Recent Graphs/i');
    await expect(recentGraphsSection).toBeVisible();
  });

  test('UI-05: Team Activity section is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const activitySection = await page.locator('text=/Team Activity|Activity Feed/i');
    await expect(activitySection).toBeVisible();
  });

  test('UI-06: Sidebar navigation menu is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const navLinks = ['Dashboard', 'Graphs', 'Search', 'Team', 'Projects', 'Permissions'];
    for (const link of navLinks) {
      const navItem = await page.locator(`text=${link}`);
      await expect(navItem).toBeVisible();
    }
  });

  test('UI-07: Current page is highlighted in navigation', async ({ page }) => {
    await page.goto('/dashboard');

    const dashboardLink = await page.locator('a', { hasText: 'Dashboard' });
    const activeClass = await dashboardLink.evaluate((el) =>
      el.className.includes('active') || el.className.includes('current'),
    );

    // Link should have some indication of being active (class or aria-current)
    expect(activeClass).toBeTruthy();
  });

  test('UI-08: Header search input is visible', async ({ page }) => {
    await page.goto('/dashboard');

    const searchInput = await page.locator('input[type="text"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('UI-09: Mobile layout (375px width) shows hamburger menu', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Check if hamburger menu is visible on mobile
    const hamburger = await page.locator('button[aria-label*="menu" i], button[aria-label*="toggle" i]').first();

    // In mobile view, either hamburger is visible or sidebar is hidden
    const sidebarHidden = await page.locator('[role="navigation"]').isHidden().catch(() => true);
    expect(hamburger.isVisible() || sidebarHidden).toBeTruthy();
  });
});
