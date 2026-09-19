import { Page } from '@playwright/test'

// Helpers

/** Log in via the /auth/login form and wait for redirect. */
export async function loginAs(
  page: Page,
  credentials: { username: string; password: string },
) {
  await page.goto('/auth/login')
  await page
    .getByTestId('username-input')
    .fill(credentials.username)
  // PasswordField wraps the native input; target by aria-label
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(credentials.password)
  await page.getByTestId('login-submit').click()
  // Wait for redirect away from /auth/login
  await page.waitForURL(
    (url) => !url.pathname.startsWith('/auth/login'),
    { timeout: 10_000 },
  )
}

/** Navigate to /super-admin and wait for hydration to settle. */
export async function goToSuperAdmin(page: Page) {
  await page.goto('/super-admin')
  // Either the guard or the dashboard should be visible
  await page
    .locator(
      '[data-testid="super-admin-denied"],'
      + '[data-testid="super-admin-dashboard-title"]',
    )
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
}

/** Wait for the tenant-list loading spinner to disappear. */
export async function waitForTenantsLoaded(
  page: Page,
): Promise<void> {
  await page
    .locator('[aria-label="Loading tenants"]')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => { /* already gone */ })
}

/** Wait for the user-list loading spinner to disappear. */
export async function waitForUsersLoaded(
  page: Page,
): Promise<void> {
  await page
    .locator('[aria-label="Loading users"]')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => { /* already gone */ })
}
