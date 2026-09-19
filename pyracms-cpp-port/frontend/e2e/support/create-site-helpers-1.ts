import { type Page } from '@playwright/test'

// Helpers

/**
 * Fast login via the create-site login page.
 * Returns once the browser has navigated away from the
 * login page (either to /create-site or shows an error).
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login/create-site')
  await page.getByTestId('username-input').fill('admin')
  await page.getByTestId('password-input').fill('password123')
  await page.getByTestId('login-submit').click()
}

/**
 * Produces a unique username safe for registration tests so
 * parallel runs or re-runs do not collide.
 */
export function uniqueUser() {
  const ts = Date.now()
  return {
    username: `testuser_${ts}`,
    email: `testuser_${ts}@example.com`,
    password: 'Passw0rd!',
  }
}

/** Wait for the tenant-list loading spinner to disappear. */
export async function waitForNoSpinner(page: Page): Promise<void> {
  await page
    .locator('[aria-label="Loading tenants"]')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => { /* already gone */ })
}
