import { Page } from '@playwright/test'
import {
  ADMIN_USER,
  BASE,
  MOCK_ACL,
  MOCK_FEATURES,
  MOCK_SETTINGS,
  MOCK_TENANTS,
  MOCK_USERS,
} from './site-admin-data-1'
import { MOCK_FILES, MOCK_MENUS, MOCK_MENU_GROUPS } from './site-admin-data-2'

/** Log in via the /auth/login form and wait for redirect. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login')
  await page
    .getByTestId('username-input')
    .fill(ADMIN_USER.username)
  await page
    .getByTestId('password-input')
    .fill(ADMIN_USER.password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL(
    (url) => !url.pathname.startsWith('/auth/login'),
    { timeout: 10_000 },
  )
}

/**
 * Set up broad API mocks so every admin page loads
 * without relying on a real back-end.
 */
export async function mockApiRoutes(page: Page): Promise<void> {
  await page.route('**/api/users**', (route) =>
    route.fulfill({ json: MOCK_USERS }),
  )
  await page.route('**/api/tenants**', (route) =>
    route.fulfill({ json: MOCK_TENANTS }),
  )
  await page.route('**/api/settings**', (route) =>
    route.fulfill({ json: MOCK_SETTINGS }),
  )
  await page.route('**/api/features**', (route) =>
    route.fulfill({ json: MOCK_FEATURES }),
  )
  await page.route('**/api/acl**', (route) =>
    route.fulfill({ json: MOCK_ACL }),
  )
  await page.route('**/api/menus**', (route) =>
    route.fulfill({ json: MOCK_MENUS }),
  )
  await page.route('**/api/menu-groups**', (route) =>
    route.fulfill({ json: MOCK_MENU_GROUPS }),
  )
  await page.route('**/api/files**', (route) =>
    route.fulfill({ json: MOCK_FILES }),
  )
  await page.route('**/api/articles**', (route) =>
    route.fulfill({ json: [] }),
  )
  await page.route('**/api/auth/register**', (route) =>
    route.fulfill({
      status: 200,
      json: { id: 99, username: 'newuser' },
    }),
  )
}

/** Navigate to a site-admin path and wait for the layout. */
export async function goToAdmin(
  page: Page,
  path: string = '',
): Promise<void> {
  await page.goto(`${BASE}${path}`)
  // The admin toolbar is always rendered by the layout
  await page
    .getByTestId('admin-toolbar')
    .waitFor({ state: 'visible', timeout: 10_000 })
}
