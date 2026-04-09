# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-ui-dashboard.spec.ts >> UI - Dashboard Page >> UI-06: Sidebar navigation menu is visible
- Location: e2e\scenarios\09-ui-dashboard.spec.ts:41:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Dashboard')
Expected: visible
Error: strict mode violation: locator('text=Dashboard') resolved to 2 elements:
    1) <span>Dashboard</span> aka getByRole('link', { name: 'Dashboard' })
    2) <h1 class="text-3xl font-semibold text-text-primary">Dashboard</h1> aka getByRole('heading', { name: 'Dashboard' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Dashboard')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - button [ref=e5] [cursor=pointer]:
        - img [ref=e6]
      - generic [ref=e7]:
        - button [ref=e8] [cursor=pointer]:
          - img [ref=e9]
        - button [ref=e12] [cursor=pointer]:
          - img [ref=e13]
    - generic [ref=e16]:
      - complementary [ref=e17]:
        - navigation [ref=e18]:
          - generic [ref=e19]:
            - link "Dashboard" [ref=e20] [cursor=pointer]:
              - /url: /dashboard
              - img [ref=e22]
              - generic [ref=e27]: Dashboard
            - link "Graphs" [ref=e28] [cursor=pointer]:
              - /url: /graphs
              - img [ref=e30]
              - generic [ref=e35]: Graphs
            - link "Search" [ref=e36] [cursor=pointer]:
              - /url: /search
              - img [ref=e38]
              - generic [ref=e41]: Search
          - generic [ref=e43]:
            - link "Team" [ref=e44] [cursor=pointer]:
              - /url: /team
              - img [ref=e46]
              - generic [ref=e51]: Team
            - link "Projects" [ref=e52] [cursor=pointer]:
              - /url: /projects
              - img [ref=e54]
              - generic [ref=e56]: Projects
            - link "Permissions" [ref=e57] [cursor=pointer]:
              - /url: /permissions
              - img [ref=e59]
              - generic [ref=e62]: Permissions
          - button "New Graph" [ref=e64] [cursor=pointer]:
            - img [ref=e65]
            - generic [ref=e66]: New Graph
      - main [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - heading "Dashboard" [level=1] [ref=e70]
            - paragraph [ref=e71]: Welcome back! Here's what's happening with your graphs.
          - generic [ref=e72]:
            - generic [ref=e74]:
              - generic [ref=e76]:
                - paragraph [ref=e77]: Total Graphs
                - heading "12" [level=3] [ref=e78]
                - paragraph [ref=e79]: ↑ +2 this month
              - generic [ref=e81]:
                - paragraph [ref=e82]: Team Members
                - heading "8" [level=3] [ref=e83]
                - paragraph [ref=e84]: ↑ +1 this week
              - generic [ref=e86]:
                - paragraph [ref=e87]: Total Nodes
                - heading "1240" [level=3] [ref=e88]
                - paragraph [ref=e89]: ↑ +89 this week
            - generic [ref=e90]:
              - generic [ref=e92]:
                - heading "Recent Graphs" [level=2] [ref=e94]
                - generic [ref=e96]:
                  - generic [ref=e97] [cursor=pointer]:
                    - generic [ref=e98]:
                      - generic [ref=e99]:
                        - heading "Company Knowledge Graph" [level=4] [ref=e100]
                        - button [ref=e101]:
                          - img [ref=e102]
                      - paragraph [ref=e104]: Main knowledge base for company • 245 items
                    - generic [ref=e105]: 2 hours ago
                    - button [ref=e106]:
                      - img [ref=e107]
                  - generic [ref=e111] [cursor=pointer]:
                    - generic [ref=e112]:
                      - generic [ref=e113]:
                        - heading "Product Architecture" [level=4] [ref=e114]
                        - button [ref=e115]:
                          - img [ref=e116]
                      - paragraph [ref=e118]: System design and components • 89 items
                    - generic [ref=e119]: 1 day ago
                    - button [ref=e120]:
                      - img [ref=e121]
                  - generic [ref=e125] [cursor=pointer]:
                    - generic [ref=e126]:
                      - generic [ref=e127]:
                        - heading "Team Skills Matrix" [level=4] [ref=e128]
                        - button [ref=e129]:
                          - img [ref=e130]
                      - paragraph [ref=e132]: Team expertise and capabilities • 42 items
                    - generic [ref=e133]: 3 days ago
                    - button [ref=e134]:
                      - img [ref=e135]
              - generic [ref=e140]:
                - heading "Team Activity" [level=2] [ref=e142]
                - generic [ref=e144]:
                  - generic [ref=e145]:
                    - img [ref=e147]
                    - generic [ref=e149]:
                      - paragraph [ref=e150]: Sarah Chen Updated "Product Architecture" graph
                      - paragraph [ref=e151]: 1 hour ago
                  - generic [ref=e152]:
                    - img [ref=e154]
                    - generic [ref=e156]:
                      - paragraph [ref=e157]: James Wilson Added comment to "Company Knowledge Graph"
                      - paragraph [ref=e158]: 3 hours ago
                  - generic [ref=e159]:
                    - img [ref=e161]
                    - generic [ref=e164]:
                      - paragraph [ref=e165]: Emma Davis Joined the workspace
                      - paragraph [ref=e166]: 1 day ago
  - button "Open Next.js Dev Tools" [ref=e172] [cursor=pointer]:
    - img [ref=e173]
  - alert [ref=e176]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('UI - Dashboard Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('UI-01: Root path redirects to /dashboard', async ({ page }) => {
  9  |     // page.goto('/') was called in beforeEach
  10 |     await page.waitForURL('/dashboard');
  11 |     expect(page.url()).toContain('/dashboard');
  12 |   });
  13 | 
  14 |   test('UI-02: Dashboard page loads successfully', async ({ page }) => {
  15 |     await page.goto('/dashboard');
  16 |     expect(page).toHaveURL('/dashboard');
  17 |   });
  18 | 
  19 |   test('UI-03: Statistics cards are displayed', async ({ page }) => {
  20 |     await page.goto('/dashboard');
  21 | 
  22 |     // Check for statistics section
  23 |     const statsSection = await page.locator('text=/Total Graphs|Team Members|Total Nodes/');
  24 |     expect(statsSection).toHaveCount(3);
  25 |   });
  26 | 
  27 |   test('UI-04: Recent Graphs section is visible', async ({ page }) => {
  28 |     await page.goto('/dashboard');
  29 | 
  30 |     const recentGraphsSection = await page.locator('text=/Recent Graphs/i');
  31 |     await expect(recentGraphsSection).toBeVisible();
  32 |   });
  33 | 
  34 |   test('UI-05: Team Activity section is visible', async ({ page }) => {
  35 |     await page.goto('/dashboard');
  36 | 
  37 |     const activitySection = await page.locator('text=/Team Activity|Activity Feed/i');
  38 |     await expect(activitySection).toBeVisible();
  39 |   });
  40 | 
  41 |   test('UI-06: Sidebar navigation menu is visible', async ({ page }) => {
  42 |     await page.goto('/dashboard');
  43 | 
  44 |     const navLinks = ['Dashboard', 'Graphs', 'Search', 'Team', 'Projects', 'Permissions'];
  45 |     for (const link of navLinks) {
  46 |       const navItem = await page.locator(`text=${link}`);
> 47 |       await expect(navItem).toBeVisible();
     |                             ^ Error: expect(locator).toBeVisible() failed
  48 |     }
  49 |   });
  50 | 
  51 |   test('UI-07: Current page is highlighted in navigation', async ({ page }) => {
  52 |     await page.goto('/dashboard');
  53 | 
  54 |     const dashboardLink = await page.locator('a', { hasText: 'Dashboard' });
  55 |     const activeClass = await dashboardLink.evaluate((el) =>
  56 |       el.className.includes('active') || el.className.includes('current'),
  57 |     );
  58 | 
  59 |     // Link should have some indication of being active (class or aria-current)
  60 |     expect(activeClass).toBeTruthy();
  61 |   });
  62 | 
  63 |   test('UI-08: Header search input is visible', async ({ page }) => {
  64 |     await page.goto('/dashboard');
  65 | 
  66 |     const searchInput = await page.locator('input[type="text"], input[placeholder*="search" i]').first();
  67 |     await expect(searchInput).toBeVisible();
  68 |   });
  69 | 
  70 |   test('UI-09: Mobile layout (375px width) shows hamburger menu', async ({ page }) => {
  71 |     // Set viewport to mobile size
  72 |     await page.setViewportSize({ width: 375, height: 667 });
  73 |     await page.goto('/dashboard');
  74 | 
  75 |     // Check if hamburger menu is visible on mobile
  76 |     const hamburger = await page.locator('button[aria-label*="menu" i], button[aria-label*="toggle" i]').first();
  77 | 
  78 |     // In mobile view, either hamburger is visible or sidebar is hidden
  79 |     const sidebarHidden = await page.locator('[role="navigation"]').isHidden().catch(() => true);
  80 |     expect(hamburger.isVisible() || sidebarHidden).toBeTruthy();
  81 |   });
  82 | });
  83 | 
```