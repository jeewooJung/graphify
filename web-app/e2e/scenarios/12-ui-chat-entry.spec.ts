import { expect, test, type Page } from '@playwright/test'

const DEMO_EMAIL = 'demo@graphify.com'
const DEMO_PASSWORD = 'demo123'

async function loginAsDemoUser(page: Page) {
  await page.goto('/auth/login')
  await page.getByPlaceholder('your@email.com').fill(DEMO_EMAIL)
  await page.getByPlaceholder('Enter your password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /sign in to graphify/i }).click()
  await page.waitForURL('/dashboard')
}

test.describe('UI - Chat Entry', () => {
  test('UI-20: Sidebar Chat opens the welcome state', async ({ page }) => {
    await loginAsDemoUser(page)

    await page.getByRole('link', { name: 'Chat' }).first().click()
    await page.waitForURL('/chat')

    await expect(page.getByRole('heading', { name: 'Graphify Chat' })).toBeVisible()
    await expect(page.getByPlaceholder('Ask Graphify a question...')).toBeVisible()

    for (const scope of ['Workspace', 'Team', 'Project']) {
      await expect(page.getByRole('button', { name: scope, exact: true })).toBeVisible()
    }
  })
})
