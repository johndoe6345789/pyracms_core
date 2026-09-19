import { type Page } from '@playwright/test'
import { MOCK_ARTICLES_LIST, MOCK_TENANT } from './tenant-data-1'

// Helpers

/**
 * Log in as the admin user via /auth/login and wait
 * for navigation away from the login page.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login')
  await page
    .getByTestId('username-input')
    .fill('admin')
  await page
    .getByTestId('password-input')
    .fill('password123')
  await page.getByTestId('login-submit').click()
  // Wait for the login page to be left
  await page
    .waitForURL(
      (url) => !url.pathname.startsWith('/auth/login'),
      { timeout: 8_000 },
    )
    .catch(() => {
      /* ignore — some env may not redirect */
    })
}

/**
 * Collect all console errors emitted during an action.
 * Returns a clean-up function and the errors array.
 */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = []
  const handler = (
    msg: import('@playwright/test').ConsoleMessage,
  ) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', handler)
  return {
    errors,
    cleanup: () => page.off('console', handler),
  }
}

/**
 * Register common tenant + article mocks used by
 * multiple suites.
 */
export async function mockTenantAndArticles(
  page: Page,
  articleItems = MOCK_ARTICLES_LIST,
) {
  await page.route('**/api/tenants**', (route) =>
    route.fulfill({ json: MOCK_TENANT }),
  )
  await page.route('**/api/articles**', (route) =>
    route.fulfill({ json: articleItems }),
  )
}
