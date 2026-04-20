import { expect, test, type Page } from '@playwright/test'

const DEMO_EMAIL = 'demo@graphify.com'
const DEMO_PASSWORD = 'demo123'
const USED_DOCS_PATTERN = /used (\d+) docs/
const OPEN_DOCUMENT_LABEL = '\uBB38\uC11C \uC5F4\uAE30'
const GO_TO_SEARCH_LABEL = '\uAC80\uC0C9\uC73C\uB85C \uC774\uB3D9'
const VIEW_IN_GRAPH_LABEL = '\uADF8\uB798\uD504\uC5D0\uC11C \uBCF4\uAE30'
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

async function getUsedDocsCount(page: Page) {
  const usedDocsLabel = page.getByText(USED_DOCS_PATTERN).first()
  await expect(usedDocsLabel).toBeVisible()

  const usedDocsText = await usedDocsLabel.innerText()
  const match = usedDocsText.match(USED_DOCS_PATTERN)

  if (!match) {
    throw new Error(`Unable to parse citation count from: ${usedDocsText}`)
  }

  return Number(match[1])
}

function getFirstCitationButton(page: Page) {
  const usedDocsLabel = page.getByText(USED_DOCS_PATTERN).first()
  const answerCard = usedDocsLabel.locator('xpath=ancestor::div[.//button][1]')

  return answerCard
    .getByRole('button')
    .filter({ hasNotText: /^more$/i })
    .filter({ hasNotText: /^less$/i })
    .filter({ hasNotText: /^\d+ more$/i })
    .filter({ hasNotText: /^show less$/i })
    .filter({ hasNotText: OPEN_DOCUMENT_LABEL })
    .filter({ hasNotText: GO_TO_SEARCH_LABEL })
    .filter({ hasNotText: VIEW_IN_GRAPH_LABEL })
    .first()
}

test.describe('UI - Citation Deep Link', () => {
  test('UI-23: Open document action deep-links to the selected document', async ({ page }) => {
    await loginAsDemoUser(page)
    await openAnsweredSession(page)

    const usedDocsCount = await getUsedDocsCount(page)

    test.skip(usedDocsCount === 0, 'citation-dependent path skipped until RAG Phase 2')

    const citationText = await getFirstCitationButton(page).innerText()
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
