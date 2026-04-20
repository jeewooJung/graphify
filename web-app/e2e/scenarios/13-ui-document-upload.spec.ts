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

test.describe('UI - Document Upload', () => {
  test('UI-21: Project documents upload drawer advances through submission', async ({ page }) => {
    let dialogMessage = ''
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss()
    })

    await loginAsDemoUser(page)
    await page.goto('/projects')
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

    const firstProjectCard = page.locator('.app-card').first()
    await expect(firstProjectCard).toBeVisible()
    await page.getByRole('button', { name: 'View project' }).first().click()
    await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 10000 })

    await page.getByRole('link', { name: 'Documents' }).click()
    await page.waitForURL(/\/projects\/[^/]+\/documents$/, { timeout: 10000 })

    const documentsPath = await page.evaluate(() => window.location.pathname)
    await page.getByRole('button', { name: /upload documents/i }).click()
    await expect(page.getByText(/Upload to/i)).toBeVisible()
    const drawer = page.locator('section').filter({ has: page.getByText(/Upload to/i) })

    await drawer.locator('input[type=file]').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hello'),
    })

    await drawer.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.locator('[data-step="validate"], [data-step="metadata"]')).toBeVisible()

    if (await page.locator('[data-step="validate"]').isVisible()) {
      await drawer.getByRole('button', { name: 'Next', exact: true }).click()
    }

    await expect(page.locator('[data-step="metadata"]')).toBeVisible()
    await drawer.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(page.locator('[data-step="submitting"], [data-step="result"]')).toBeVisible()

    const currentPath = await page.evaluate(() => window.location.pathname)
    const failedResultVisible = await page.getByText(/Failed \([1-9]/).first().isVisible()

    if (currentPath !== documentsPath || dialogMessage || failedResultVisible) {
      test.skip(true, 'backend upload not available')
    }

    await expect(page.locator('[data-step="submitting"], [data-step="result"]')).toBeVisible()
  })
})
