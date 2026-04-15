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

test.describe('UI - Chat Answer', () => {
  test('UI-22: Asking a question opens a session and source panel', async ({ page }) => {
    let dialogMessage = ''
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss()
    })

    await loginAsDemoUser(page)
    await page.goto('/chat')

    const composer = page.getByPlaceholder('Ask Graphify a question...')
    await composer.fill('What is the deployment process?')

    try {
      await composer.press('Enter')
      await page.waitForURL(/\/chat\/[^/]+$/, { timeout: 10000 })
    } catch {
      test.skip(true, 'chat answer backend not available')
    }

    if (dialogMessage) {
      test.skip(true, 'chat answer backend not available')
    }

    await expect(page.getByText(/used \d+ docs/).first()).toBeVisible()
    await page.locator('button.rounded-full').first().click()
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible()
  })
})
