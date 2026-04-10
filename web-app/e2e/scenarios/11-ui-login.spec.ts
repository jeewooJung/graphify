import { test, expect } from '@playwright/test'

const DEMO_EMAIL = 'demo@graphify.com'
const DEMO_PASSWORD = 'demo123'

async function fillLoginForm(page: import('@playwright/test').Page, email: string, password: string) {
  await page.getByPlaceholder('your@email.com').fill(email)
  await page.getByPlaceholder('Enter your password').fill(password)
}

test.describe('UI - Login Flow', () => {
  test('UI-16: Protected route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')

    await page.waitForURL('/auth/login')
    await expect(page.getByRole('heading', { name: /continue to your workspace/i })).toBeVisible()
  })

  test('UI-17: Valid login redirects to dashboard and shows current user', async ({ page }) => {
    await page.goto('/auth/login')

    await fillLoginForm(page, DEMO_EMAIL, DEMO_PASSWORD)
    await page.getByRole('button', { name: /sign in to graphify/i }).click()

    await page.waitForURL('/dashboard')
    await expect(page.getByText('Welcome to your graph workspace', { exact: true })).toBeVisible()
    await expect(page.getByText('Demo User', { exact: true }).first()).toBeVisible()
  })

  test('UI-18: Logged-in user can sign out and is returned to login page', async ({ page }) => {
    await page.goto('/auth/login')

    await fillLoginForm(page, DEMO_EMAIL, DEMO_PASSWORD)
    await page.getByRole('button', { name: /sign in to graphify/i }).click()

    await page.waitForURL('/dashboard')
    await page.getByRole('button').filter({ hasText: 'Demo User' }).click()
    await page.getByRole('button', { name: /sign out/i }).click()

    await page.waitForURL('/auth/login')
    await expect(page.getByRole('heading', { name: /continue to your workspace/i })).toBeVisible()
  })

  test('UI-19: Invalid login shows an error message', async ({ page }) => {
    await page.goto('/auth/login')

    await fillLoginForm(page, DEMO_EMAIL, 'wrong-password')
    await page.getByRole('button', { name: /sign in to graphify/i }).click()

    await expect(page.getByText(/login failed|invalid|incorrect/i).first()).toBeVisible()
    await expect(page).toHaveURL('/auth/login')
  })
})
