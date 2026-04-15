import { expect, test, type Page } from '@playwright/test'

const DEMO_EMAIL = 'demo@graphify.com'
const DEMO_PASSWORD = 'demo123'
const OPEN_DOCUMENT_LABEL = '\uBB38\uC11C \uC5F4\uAE30'
const SELECT_DOCUMENT_HINT = '\uBB38\uC11C\uB97C \uC120\uD0DD\uD558\uC138\uC694'

async function loginAsDemoUser(page: Page) {
  await page.goto('/auth/login')
  await page.getByPlaceholder('your@email.com').fill(DEMO_EMAIL)
  await page.getByPlaceholder('Enter your password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: /sign in to graphify/i }).click()
  await page.waitForURL('/dashboard')
}

async function openAnsweredSession(page: Page) {
  let dialogMessage = ''
  page.on('dialog', async (dialog) => {
    dialogMessage = dialog.message()
    await dialog.dismiss()
  })

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
}

test.describe('UI - Citation Deep Link', () => {
  test('UI-23: Open document action deep-links to the selected document', async ({ page }) => {
    await loginAsDemoUser(page)
    await openAnsweredSession(page)

    await expect(page.getByText(/used \d+ docs/).first()).toBeVisible()
    const citationText = await page.locator('button.rounded-full').first().innerText()
    const documentTitle = citationText.split('\u00B7')[0].trim()

    await page.getByRole('button', { name: OPEN_DOCUMENT_LABEL }).first().click()
    await page.waitForURL(/\/projects\/[^/]+\/documents\?documentId=[^&]+&chunkId=[^&]+$/, {
      timeout: 10000,
    })

    await expect(page).toHaveURL(/documentId=[^&]+&chunkId=[^&]+/)
    await expect(page.getByText(documentTitle, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(SELECT_DOCUMENT_HINT)).toHaveCount(0)
  })
})
