# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-ui-graphs.spec.ts >> UI - Graph Explorer Page >> UI-11: NodesList panel is visible (left)
- Location: e2e\scenarios\10-ui-graphs.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('ul, ol, [class*="list"], [class*="panel"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('ul, ol, [class*="list"], [class*="panel"]').first()

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
          - generic [ref=e70]:
            - generic [ref=e71]:
              - heading "Nodes" [level=2] [ref=e72]
              - generic [ref=e73]:
                - img [ref=e74]
                - textbox "Search nodes..." [ref=e77]
              - generic [ref=e78]:
                - button "entity" [ref=e79]
                - button "concept" [ref=e80]
                - button "relation" [ref=e81]
            - generic [ref=e82]:
              - generic [ref=e85] [cursor=pointer]:
                - heading "Product" [level=4] [ref=e87]
                - generic [ref=e88]:
                  - generic [ref=e89]: entity
                  - generic [ref=e90]: 12 connections
              - generic [ref=e93] [cursor=pointer]:
                - heading "User" [level=4] [ref=e95]
                - generic [ref=e96]:
                  - generic [ref=e97]: entity
                  - generic [ref=e98]: 8 connections
              - generic [ref=e101] [cursor=pointer]:
                - heading "has_feature" [level=4] [ref=e103]
                - generic [ref=e104]:
                  - generic [ref=e105]: relation
                  - generic [ref=e106]: 15 connections
              - generic [ref=e109] [cursor=pointer]:
                - heading "Architecture" [level=4] [ref=e111]
                - generic [ref=e112]:
                  - generic [ref=e113]: concept
                  - generic [ref=e114]: 5 connections
          - paragraph [ref=e122]: Select a node to view properties
  - button "Open Next.js Dev Tools" [ref=e128] [cursor=pointer]:
    - img [ref=e129]
  - alert [ref=e132]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('UI - Graph Explorer Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/graphs');
  6  |   });
  7  | 
  8  |   test('UI-10: Graph explorer page loads with 3-panel layout', async ({ page }) => {
  9  |     await page.goto('/graphs');
  10 |     expect(page).toHaveURL('/graphs');
  11 | 
  12 |     // Check for main content
  13 |     const mainContent = page.locator('main');
  14 |     await expect(mainContent).toBeVisible();
  15 |   });
  16 | 
  17 |   test('UI-11: NodesList panel is visible (left)', async ({ page }) => {
  18 |     await page.goto('/graphs');
  19 | 
  20 |     // Look for nodes list or sidebar with node content
  21 |     const nodesList = page.locator('[role="region"]').first();
  22 |     await expect(nodesList).toBeVisible().catch(async () => {
  23 |       // Fallback: look for any list or panel
  24 |       const anyList = page.locator('ul, ol, [class*="list"], [class*="panel"]').first();
> 25 |       await expect(anyList).toBeVisible();
     |                             ^ Error: expect(locator).toBeVisible() failed
  26 |     });
  27 |   });
  28 | 
  29 |   test('UI-12: GraphCanvas (3D visualization) is visible', async ({ page }) => {
  30 |     await page.goto('/graphs');
  31 | 
  32 |     // Look for canvas element (three.js uses canvas)
  33 |     const canvas = page.locator('canvas').first();
  34 |     await expect(canvas).toBeVisible().catch(async () => {
  35 |       // Fallback: look for any visualization container
  36 |       const viz = page.locator('[class*="canvas"], [class*="viz"], [class*="graph"]').first();
  37 |       await expect(viz).toBeVisible();
  38 |     });
  39 |   });
  40 | 
  41 |   test('UI-13: PropertiesPanel (right) is visible', async ({ page }) => {
  42 |     await page.goto('/graphs');
  43 | 
  44 |     // Look for properties panel
  45 |     const propsPanel = page.locator('[class*="properties"], [class*="panel"], [class*="detail"]').last();
  46 |     await expect(propsPanel).toBeVisible().catch(async () => {
  47 |       // Fallback: look for any right sidebar
  48 |       const rightSidebar = page.locator('aside').last();
  49 |       await expect(rightSidebar).toBeVisible();
  50 |     });
  51 |   });
  52 | 
  53 |   test('UI-14: Graphs link is active in sidebar', async ({ page }) => {
  54 |     await page.goto('/graphs');
  55 | 
  56 |     const graphsLink = page.locator('a', { hasText: /Graphs/i });
  57 |     const isActive = await graphsLink.evaluate((el) =>
  58 |       el.className.includes('active') || el.className.includes('current'),
  59 |     );
  60 | 
  61 |     expect(isActive).toBeTruthy();
  62 |   });
  63 | 
  64 |   test('UI-15: NodesList search filter works', async ({ page }) => {
  65 |     await page.goto('/graphs');
  66 | 
  67 |     // Find search/filter input in nodes panel
  68 |     const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="filter" i]').first();
  69 | 
  70 |     if (await searchInput.isVisible()) {
  71 |       // Type in search
  72 |       await searchInput.fill('test');
  73 |       // Check that some filtering happened (list changed or filtered message appeared)
  74 |       await page.waitForTimeout(500);
  75 |     }
  76 |   });
  77 | });
  78 | 
```