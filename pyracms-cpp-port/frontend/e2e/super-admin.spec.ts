/**
 * E2E tests — Super Admin panel
 *
 * Assumes the dev server is running at http://localhost:3000
 * with at least two seeded accounts:
 *   • regular user:  username=user1  / password=password
 *   • super admin:   username=admin  / password=password
 *
 * Adjust ADMIN_USER / REGULAR_USER constants below if your
 * seed data uses different credentials.
 */

import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Credentials — change these to match your seeded test accounts
// ---------------------------------------------------------------------------
const ADMIN_USER = {
  username: 'admin',
  password: 'password',
}
const REGULAR_USER = {
  username: 'user1',
  password: 'password',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Log in via the /auth/login form and wait for redirect. */
async function loginAs(
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
async function goToSuperAdmin(page: Page) {
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
async function waitForTenantsLoaded(
  page: Page,
): Promise<void> {
  await page
    .locator('[aria-label="Loading tenants"]')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => { /* already gone */ })
}

/** Wait for the user-list loading spinner to disappear. */
async function waitForUsersLoaded(
  page: Page,
): Promise<void> {
  await page
    .locator('[aria-label="Loading users"]')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => { /* already gone */ })
}

// ---------------------------------------------------------------------------
// Mocked tenant / user payloads
// ---------------------------------------------------------------------------

const MOCK_TENANTS = [
  {
    id: 1,
    slug: 'alpha',
    displayName: 'Alpha',
    ownerUsername: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    slug: 'beta',
    displayName: 'Beta',
    ownerUsername: 'user1',
    isActive: false,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 4,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: 1,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'banned1',
    email: 'banned1@example.com',
    role: 1,
    isActive: false,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// 1. Access denied — unauthenticated
// ---------------------------------------------------------------------------
test.describe('Access denied — unauthenticated', () => {
  test(
    'shows Access Denied without a login session',
    async ({ page }) => {
      await goToSuperAdmin(page)

      const denied = page.getByTestId('super-admin-denied')
      await expect(denied).toBeVisible()
      await expect(denied).toContainText('Access Denied')
    },
  )
})

// ---------------------------------------------------------------------------
// 2. Access denied — regular user (role < 4)
// ---------------------------------------------------------------------------
test.describe('Access denied — regular user', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, REGULAR_USER)
  })

  test(
    'regular user (role < SuperAdmin) is blocked from '
    + '/super-admin',
    async ({ page }) => {
      await goToSuperAdmin(page)

      const denied = page.getByTestId('super-admin-denied')
      await expect(denied).toBeVisible()
      await expect(denied).toContainText('Access Denied')
    },
  )
})

// ---------------------------------------------------------------------------
// 3. Super admin access
// ---------------------------------------------------------------------------
test.describe('Super admin — authenticated access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  test(
    'shows Platform Overview dashboard',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('super-admin-dashboard-title'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-dashboard-title'),
      ).toHaveText('Platform Overview')
    },
  )

  test(
    'sidebar contains all primary nav links',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('super-admin-nav-dashboard'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-tenants'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-users'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-settings'),
      ).toBeVisible()
    },
  )

  test(
    'quick-action cards are rendered',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('quick-tenants'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-users'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-settings'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-create-site'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 4. Tenant management
// ---------------------------------------------------------------------------
test.describe('Tenant management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'shows "Tenants" heading and "New Site" button',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Tenants' }),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toContainText('New Site')
    },
  )

  test(
    '"New Site" button links to /create-site',
    async ({ page }) => {
      const btn = page.getByTestId('new-tenant-button')
      await expect(btn).toHaveAttribute(
        'href',
        '/create-site',
      )
    },
  )

  test(
    '"New Site" button has accessible aria-label',
    async ({ page }) => {
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toHaveAttribute('aria-label', 'Create new site')
    },
  )

  test(
    '"New Site" button is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('new-tenant-button')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL('/create-site')
    },
  )

  test(
    'tenant management table is rendered',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      await expect(
        page.getByTestId('tenant-management-table'),
      ).toBeVisible()
    },
  )

  test(
    'at least one tenant-row-* is visible when '
    + 'tenants exist',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const rows = page.locator(
        '[data-testid^="tenant-row-"]',
      )
      const count = await rows.count()

      if (count === 0) {
        // No tenants seeded — verify empty-state text
        await expect(
          page.getByText('No tenants found.'),
        ).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  // -------------------------------------------------------------------------
  // Open Site link
  // -------------------------------------------------------------------------

  test(
    '"Open Site" icon button links to /site/{slug}',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      const openBtn = page.getByTestId('open-tenant-alpha')
      await expect(openBtn).toBeVisible()
      await expect(openBtn).toHaveAttribute(
        'href',
        '/site/alpha',
      )
    },
  )

  test(
    '"Open Site" button has accessible aria-label',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await expect(
        page.getByTestId('open-tenant-alpha'),
      ).toHaveAttribute('aria-label', 'Open Alpha')
    },
  )

  test(
    '"Open Site" button navigates to /site/{slug}',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page.getByTestId('open-tenant-alpha').click()
      await expect(page).toHaveURL(/\/site\/alpha/)
    },
  )

  // -------------------------------------------------------------------------
  // Delete button + dialog
  // -------------------------------------------------------------------------

  test(
    'clicking delete opens confirmation dialog',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      await deleteButtons.first().click()

      const dialog =
        page.getByTestId('tenant-delete-dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog).toContainText('Delete Tenant?')
    },
  )

  test(
    'delete dialog contains warning text about '
    + 'irreversibility',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).toContainText('cannot be undone')
    },
  )

  test(
    'cancel in delete dialog closes it without '
    + 'removing row',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      // Capture the slug of the first row before dialog
      const firstRow = page
        .locator('[data-testid^="tenant-row-"]')
        .first()
      const testId =
        (await firstRow.getAttribute('data-testid')) ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page
        .getByTestId('cancel-delete-tenant')
        .click()

      // Dialog should be gone
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      // Row should still exist
      await expect(
        page.getByTestId(`tenant-row-${slug}`),
      ).toBeVisible()
    },
  )

  test(
    'pressing Escape closes delete dialog',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'cancel-delete-tenant button is keyboard-focusable',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()

      const cancel =
        page.getByTestId('cancel-delete-tenant')
      await cancel.focus()
      await expect(cancel).toBeFocused()
    },
  )

  test(
    'confirm-delete-tenant button is keyboard-activatable',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TENANTS),
          })
        }
        if (route.request().method() === 'DELETE') {
          return route.fulfill({ status: 204 })
        }
        return route.continue()
      })

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()

      const confirmBtn = page.getByTestId(
        'confirm-delete-tenant',
      )
      await confirmBtn.focus()
      await expect(confirmBtn).toBeFocused()
      await page.keyboard.press('Enter')

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'tenant filter input narrows visible rows',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const rows = page.locator(
        '[data-testid^="tenant-row-"]',
      )
      const count = await rows.count()
      if (count === 0) {
        test.skip()
        return
      }

      // Type a string that matches nothing
      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      await filterInput.fill('__nonexistent_tenant__')
      await expect(
        page.getByText('No tenants found.'),
      ).toBeVisible()

      // Clear filter — rows come back
      await filterInput.clear()
      await expect(rows.first()).toBeVisible()
    },
  )

  test(
    'filter input clears with keyboard (Ctrl+A Delete)',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      await filterInput.fill('alpha')
      // Rows for 'beta' should be hidden
      await expect(
        page.getByTestId('tenant-row-beta'),
      ).not.toBeVisible()

      // Keyboard-clear
      await filterInput.press('Control+a')
      await filterInput.press('Delete')
      await expect(filterInput).toHaveValue('')
      // Both rows visible again
      await expect(
        page.getByTestId('tenant-row-alpha'),
      ).toBeVisible()
      await expect(
        page.getByTestId('tenant-row-beta'),
      ).toBeVisible()
    },
  )

  test(
    'filter input has accessible aria-label',
    async ({ page }) => {
      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      // The nested input carries the aria-label
      await expect(
        filterInput.locator('input'),
      ).toHaveAttribute('aria-label', 'Filter tenants')
    },
  )

  test(
    'no-match empty state shows "No tenants found."',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      await filterInput.fill('__no_match__')
      await expect(
        page.getByText('No tenants found.'),
      ).toBeVisible()
    },
  )

  test(
    'confirm delete removes tenant from the list',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      const firstRow = page
        .locator('[data-testid^="tenant-row-"]')
        .first()
      const testId =
        (await firstRow.getAttribute('data-testid')) ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page
        .getByTestId('confirm-delete-tenant')
        .click()

      // Dialog closes and the row disappears
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      await expect(
        page.getByTestId(`tenant-row-${slug}`),
      ).not.toBeVisible()
    },
  )

  test(
    'mocked confirm delete removes row via DELETE API',
    async ({ page }) => {
      let deleteCallCount = 0
      await page.route('**/api/tenants**', (route) => {
        const method = route.request().method()
        if (method === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TENANTS),
          })
        }
        if (method === 'DELETE') {
          deleteCallCount++
          return route.fulfill({ status: 204 })
        }
        return route.continue()
      })

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).toBeVisible()

      await page
        .getByTestId('confirm-delete-tenant')
        .click()

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      await expect(
        page.getByTestId('tenant-row-alpha'),
      ).not.toBeVisible()

      expect(deleteCallCount).toBe(1)
    },
  )

  // -------------------------------------------------------------------------
  // Breadcrumbs on tenants page
  // -------------------------------------------------------------------------

  test(
    'breadcrumbs are visible on tenants page',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-breadcrumbs'),
      ).toBeVisible()
    },
  )

  test(
    'breadcrumb current item reads "Tenants"',
    async ({ page }) => {
      await expect(
        page.getByTestId('breadcrumb-current'),
      ).toHaveText('Tenants')
    },
  )

  test(
    'breadcrumb link navigates back to /super-admin',
    async ({ page }) => {
      await page
        .getByTestId('breadcrumb-link-super-admin')
        .click()
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )
})

// ---------------------------------------------------------------------------
// 5. User management
// ---------------------------------------------------------------------------
test.describe('User management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'shows "Global Users" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Global Users' }),
      ).toBeVisible()
    },
  )

  test(
    'global users table is rendered',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      await expect(
        page.getByTestId('global-users-table'),
      ).toBeVisible()
    },
  )

  test(
    'at least one user-row-* is visible',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      const rows = page.locator(
        '[data-testid^="user-row-"]',
      )
      const count = await rows.count()

      if (count === 0) {
        await expect(
          page.getByText('No users found.'),
        ).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  test(
    'role select dropdowns are present for each user',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      const roleSelects = page.locator(
        '[data-testid^="role-select-"]',
      )
      const count = await roleSelects.count()

      if (count === 0) {
        test.skip()
        return
      }

      await expect(roleSelects.first()).toBeVisible()
    },
  )

  test(
    'role select contains all five role options',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      const roleSelects = page.locator(
        '[data-testid^="role-select-"]',
      )
      if ((await roleSelects.count()) === 0) {
        test.skip()
        return
      }

      // Open the first select
      await roleSelects.first().click()

      const options = page.getByRole('option')
      await expect(
        options.filter({ hasText: 'Guest' }),
      ).toBeVisible()
      await expect(
        options.filter({ hasText: 'User' }),
      ).toBeVisible()
      await expect(
        options.filter({ hasText: 'Moderator' }),
      ).toBeVisible()
      await expect(
        options.filter({ hasText: 'Site Admin' }),
      ).toBeVisible()
      await expect(
        options.filter({ hasText: 'Super Admin' }),
      ).toBeVisible()

      // Close the menu without making a change
      await page.keyboard.press('Escape')
    },
  )

  // -------------------------------------------------------------------------
  // Ban / Unban toggle
  // -------------------------------------------------------------------------

  test(
    'banned user row shows "Banned" status chip',
    async ({ page }) => {
      await page.route('**/api/users', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USERS),
        }),
      )

      await page.goto('/super-admin/users')
      await page
        .getByTestId('super-admin-users-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForUsersLoaded(page)

      const bannedRow =
        page.getByTestId('user-row-banned1')
      await expect(bannedRow).toBeVisible()
      await expect(bannedRow).toContainText('Banned')
    },
  )

  test(
    'active user row shows "Active" status chip',
    async ({ page }) => {
      await page.route('**/api/users', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USERS),
        }),
      )

      await page.goto('/super-admin/users')
      await page
        .getByTestId('super-admin-users-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForUsersLoaded(page)

      const userRow = page.getByTestId('user-row-user1')
      await expect(userRow).toBeVisible()
      await expect(userRow).toContainText('Active')
    },
  )

  // -------------------------------------------------------------------------
  // Role change
  // -------------------------------------------------------------------------

  test(
    'role select has aria-label "Role for {username}"',
    async ({ page }) => {
      await page.route('**/api/users', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USERS),
        }),
      )

      await page.goto('/super-admin/users')
      await page
        .getByTestId('super-admin-users-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForUsersLoaded(page)

      const select =
        page.getByTestId('role-select-user1')
      await expect(select).toBeVisible()
      // The inner <input> carries the aria-label
      await expect(
        select.locator('input'),
      ).toHaveAttribute('aria-label', 'Role for user1')
    },
  )

  test(
    'mocked role change calls PUT /api/users/{id}',
    async ({ page }) => {
      let putBody: unknown = null
      await page.route('**/api/users**', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_USERS),
          })
        }
        if (route.request().method() === 'PUT') {
          putBody = JSON.parse(
            route.request().postData() ?? '{}',
          )
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({}),
          })
        }
        return route.continue()
      })

      await page.goto('/super-admin/users')
      await page
        .getByTestId('super-admin-users-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForUsersLoaded(page)

      // Open the role select for user1 (role=1)
      await page
        .getByTestId('role-select-user1')
        .click()

      // Choose Moderator (role=2)
      await page
        .getByRole('option', { name: 'Moderator' })
        .click()

      // Give the PUT request time to fire
      await page.waitForTimeout(500)
      expect(putBody).not.toBeNull()
    },
  )

  // -------------------------------------------------------------------------
  // Breadcrumbs on users page
  // -------------------------------------------------------------------------

  test(
    'breadcrumbs are visible on users page',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-breadcrumbs'),
      ).toBeVisible()
    },
  )

  test(
    'breadcrumb current item reads "Users"',
    async ({ page }) => {
      await expect(
        page.getByTestId('breadcrumb-current'),
      ).toHaveText('Users')
    },
  )
})

// ---------------------------------------------------------------------------
// 6. Navigation
// ---------------------------------------------------------------------------
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'Tenants nav item navigates to /super-admin/tenants',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-nav-tenants')
        .click()
      await expect(page).toHaveURL(
        /\/super-admin\/tenants/,
      )
      await expect(
        page.getByTestId('super-admin-tenants-page'),
      ).toBeVisible()
    },
  )

  test(
    'Users nav item navigates to /super-admin/users',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-nav-users')
        .click()
      await expect(page).toHaveURL(/\/super-admin\/users/)
      await expect(
        page.getByTestId('super-admin-users-page'),
      ).toBeVisible()
    },
  )

  test(
    'Settings nav item navigates to '
    + '/super-admin/settings',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-nav-settings')
        .click()
      await expect(page).toHaveURL(
        /\/super-admin\/settings/,
      )
      await expect(
        page.getByTestId('super-admin-settings-page'),
      ).toBeVisible()
    },
  )

  test(
    'Dashboard nav item navigates back to /super-admin',
    async ({ page }) => {
      // Go somewhere else first
      await page.goto('/super-admin/users')
      await page
        .getByTestId('super-admin-nav-dashboard')
        .click()
      await expect(page).toHaveURL(/\/super-admin$/)
      await expect(
        page.getByTestId('super-admin-dashboard-title'),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Portal" link navigates to /',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-back-portal')
        .click()
      await expect(page).toHaveURL('/')
    },
  )

  test(
    'settings page shows Platform Settings heading',
    async ({ page }) => {
      await page.goto('/super-admin/settings')
      await expect(
        page.getByRole('heading', {
          name: 'Platform Settings',
        }),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 7. Keyboard navigation
// ---------------------------------------------------------------------------
test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'all sidebar nav items are reachable and activatable '
    + 'via keyboard',
    async ({ page }) => {
      // Focus the sidebar nav list region
      const navList = page.getByTestId(
        'super-admin-nav-list',
      )
      await navList.focus()

      const navTestIds = [
        'super-admin-nav-dashboard',
        'super-admin-nav-tenants',
        'super-admin-nav-users',
        'super-admin-nav-settings',
      ]

      for (const testId of navTestIds) {
        const item = page.getByTestId(testId)
        // Each list item button should be focusable
        await item.focus()
        await expect(item).toBeFocused()
      }
    },
  )

  test(
    'Enter key on Tenants nav activates the link',
    async ({ page }) => {
      const tenantsNav = page.getByTestId(
        'super-admin-nav-tenants',
      )
      await tenantsNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        /\/super-admin\/tenants/,
      )
    },
  )

  test(
    'Enter key on Users nav activates the link',
    async ({ page }) => {
      const usersNav = page.getByTestId(
        'super-admin-nav-users',
      )
      await usersNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/super-admin\/users/)
    },
  )

  test(
    'Enter key on Settings nav activates the link',
    async ({ page }) => {
      const settingsNav = page.getByTestId(
        'super-admin-nav-settings',
      )
      await settingsNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        /\/super-admin\/settings/,
      )
    },
  )

  test(
    'Enter key on Dashboard nav navigates to '
    + '/super-admin',
    async ({ page }) => {
      await page.goto('/super-admin/users')
      const dashNav = page.getByTestId(
        'super-admin-nav-dashboard',
      )
      await dashNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )

  test(
    'Tab order: Dashboard → Tenants → Users → Settings',
    async ({ page }) => {
      const dashboard = page.getByTestId(
        'super-admin-nav-dashboard',
      )
      await dashboard.focus()
      await expect(dashboard).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(
        page.getByTestId('super-admin-nav-tenants'),
      ).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(
        page.getByTestId('super-admin-nav-users'),
      ).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(
        page.getByTestId('super-admin-nav-settings'),
      ).toBeFocused()
    },
  )

  test(
    'Space key on Dashboard nav item activates it',
    async ({ page }) => {
      await page.goto('/super-admin/tenants')
      const dashNav = page.getByTestId(
        'super-admin-nav-dashboard',
      )
      await dashNav.focus()
      await page.keyboard.press('Space')
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )
})

// ---------------------------------------------------------------------------
// 8. Mobile responsive
// ---------------------------------------------------------------------------
test.describe('Mobile responsive — 375x667', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'hamburger menu button is visible on mobile',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-menu-toggle'),
      ).toBeVisible()
    },
  )

  test(
    'clicking hamburger opens drawer with nav items',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-menu-toggle')
        .click()

      const drawer = page.getByTestId(
        'super-admin-drawer-mobile',
      )
      await expect(drawer).toBeVisible()

      // Nav items inside the drawer
      await expect(
        drawer.getByTestId('super-admin-nav-dashboard'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-tenants'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-users'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-settings'),
      ).toBeVisible()
    },
  )

  test(
    'hamburger button has accessible aria-label',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-menu-toggle'),
      ).toHaveAttribute(
        'aria-label',
        'Open super admin menu',
      )
    },
  )

  test(
    'clicking a nav item in the drawer closes it and '
    + 'navigates',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-menu-toggle')
        .click()

      const drawer = page.getByTestId(
        'super-admin-drawer-mobile',
      )
      await expect(drawer).toBeVisible()

      await drawer
        .getByTestId('super-admin-nav-tenants')
        .click()

      await expect(page).toHaveURL(
        /\/super-admin\/tenants/,
      )
      // Drawer should auto-close after nav click
      await expect(
        page.getByTestId('super-admin-drawer-mobile'),
      ).not.toBeVisible({ timeout: 5_000 })
    },
  )

  test(
    'permanent sidebar is NOT visible at mobile width',
    async ({ page }) => {
      // On mobile, only the temporary drawer is used
      await expect(
        page.getByTestId('super-admin-sidebar'),
      ).not.toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 9. AppBar toolbar — ThemeToggle and UserBubble
// ---------------------------------------------------------------------------
test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'super admin toolbar is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'toolbar displays "PyraCMS Super Admin" title',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-toolbar'),
      ).toContainText('PyraCMS Super Admin')
    },
  )

  // -------------------------------------------------------------------------
  // ThemeToggle
  // -------------------------------------------------------------------------

  test(
    'ThemeToggle button is visible in the AppBar',
    async ({ page }) => {
      await expect(
        page.getByTestId('theme-toggle'),
      ).toBeVisible()
    },
  )

  test(
    'ThemeToggle button opens the theme menu on click',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
    },
  )

  test(
    'theme menu contains Light, Dark, System options',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-light'),
      ).toBeVisible()
      await expect(
        page.getByTestId('theme-dark'),
      ).toBeVisible()
      await expect(
        page.getByTestId('theme-system'),
      ).toBeVisible()
    },
  )

  test(
    'selecting "Dark" from theme menu closes the menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await page.getByTestId('theme-dark').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )

  test(
    'selecting "Light" from theme menu closes the menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await page.getByTestId('theme-light').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )

  test(
    'Escape closes the theme menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )

  test(
    'ThemeToggle has aria-haspopup="true"',
    async ({ page }) => {
      await expect(
        page.getByTestId('theme-toggle'),
      ).toHaveAttribute('aria-haspopup', 'true')
    },
  )

  test(
    'ThemeToggle aria-expanded changes when open',
    async ({ page }) => {
      const btn = page.getByTestId('theme-toggle')
      await expect(btn).toHaveAttribute(
        'aria-expanded',
        'false',
      )
      await btn.click()
      await expect(btn).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    },
  )

  test(
    'ThemeToggle is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('theme-toggle')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
    },
  )

  // -------------------------------------------------------------------------
  // UserBubble / avatar menu
  // -------------------------------------------------------------------------

  test(
    'UserBubble avatar button is visible when '
    + 'authenticated',
    async ({ page }) => {
      await expect(
        page.getByTestId('user-bubble-btn'),
      ).toBeVisible()
    },
  )

  test(
    'UserBubble avatar button has aria-label "User menu"',
    async ({ page }) => {
      await expect(
        page.getByTestId('user-bubble-btn'),
      ).toHaveAttribute('aria-label', 'User menu')
    },
  )

  test(
    'clicking UserBubble opens the user menu',
    async ({ page }) => {
      await page.getByTestId('user-bubble-btn').click()
      // The menu contains the admin/settings/logout items
      await expect(
        page.getByTestId('logout-btn'),
      ).toBeVisible()
    },
  )

  test(
    'user menu contains Admin, Settings, Sign Out items',
    async ({ page }) => {
      await page.getByTestId('user-bubble-btn').click()
      await expect(
        page.getByTestId('admin-link'),
      ).toBeVisible()
      await expect(
        page.getByTestId('settings-link'),
      ).toBeVisible()
      await expect(
        page.getByTestId('logout-btn'),
      ).toBeVisible()
    },
  )

  test(
    'Escape closes the user menu',
    async ({ page }) => {
      await page.getByTestId('user-bubble-btn').click()
      await expect(
        page.getByTestId('logout-btn'),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(
        page.getByTestId('logout-btn'),
      ).not.toBeVisible()
    },
  )

  test(
    'clicking "Sign Out" logs out and redirects to /',
    async ({ page }) => {
      await page.getByTestId('user-bubble-btn').click()
      await page.getByTestId('logout-btn').click()
      await expect(page).toHaveURL('/')
    },
  )

  test(
    'UserBubble avatar button is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('user-bubble-btn')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByTestId('logout-btn'),
      ).toBeVisible()
    },
  )

  test(
    'unauthenticated user sees guest-login-link '
    + 'instead of avatar',
    async ({ page: guestPage }) => {
      // New unauthenticated page context
      await guestPage.goto('/super-admin')
      await guestPage
        .locator(
          '[data-testid="super-admin-denied"],'
          + '[data-testid="super-admin-dashboard-title"]',
        )
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })

      // If the access-denied guard still renders the
      // AppBar, the guest chip should be visible.
      const guestChip = guestPage.getByTestId(
        'guest-login-link',
      )
      const isVisible = await guestChip
        .isVisible()
        .catch(() => false)
      if (isVisible) {
        await expect(guestChip).toHaveAttribute(
          'href',
          '/auth/login',
        )
      }
    },
  )
})

// ---------------------------------------------------------------------------
// 10. Settings page
// ---------------------------------------------------------------------------
test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/settings')
    await page
      .getByTestId('super-admin-settings-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'settings page renders with correct heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: 'Platform Settings',
        }),
      ).toBeVisible()
    },
  )

  test(
    'settings page shows informational alert',
    async ({ page }) => {
      await expect(
        page.getByRole('alert'),
      ).toBeVisible()
      await expect(
        page.getByRole('alert'),
      ).toContainText('Global platform settings')
    },
  )

  test(
    'settings page shows TuneOutlined icon '
    + '(aria-hidden)',
    async ({ page }) => {
      // The icon is aria-hidden; verify it is in DOM
      // inside the settings page container.
      const icon = page
        .getByTestId('super-admin-settings-page')
        .locator('[aria-hidden="true"]')
        .first()
      await expect(icon).toBeAttached()
    },
  )

  // -------------------------------------------------------------------------
  // Breadcrumbs on settings page
  // -------------------------------------------------------------------------

  test(
    'breadcrumbs are visible on settings page',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-breadcrumbs'),
      ).toBeVisible()
    },
  )

  test(
    'breadcrumb current item reads "Settings"',
    async ({ page }) => {
      await expect(
        page.getByTestId('breadcrumb-current'),
      ).toHaveText('Settings')
    },
  )

  test(
    'breadcrumb "Super Admin" link navigates to '
    + '/super-admin',
    async ({ page }) => {
      await page
        .getByTestId('breadcrumb-link-super-admin')
        .click()
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )
})

// ---------------------------------------------------------------------------
// 11. Breadcrumbs — per-page verification
// ---------------------------------------------------------------------------
test.describe('Breadcrumbs — per page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  const PAGES: [string, string, string][] = [
    [
      '/super-admin',
      'Super Admin',
      '',
    ],
    [
      '/super-admin/tenants',
      'Tenants',
      'breadcrumb-link-super-admin',
    ],
    [
      '/super-admin/users',
      'Users',
      'breadcrumb-link-super-admin',
    ],
    [
      '/super-admin/settings',
      'Settings',
      'breadcrumb-link-super-admin',
    ],
  ]

  for (const [path, currentLabel, linkTestId] of PAGES) {
    test(
      `${path} breadcrumb current = "${currentLabel}"`,
      async ({ page }) => {
        await page.goto(path)
        await page
          .getByTestId('super-admin-breadcrumbs')
          .waitFor({ state: 'visible', timeout: 10_000 })

        await expect(
          page.getByTestId('breadcrumb-current'),
        ).toHaveText(currentLabel)

        if (linkTestId) {
          await expect(
            page.getByTestId(linkTestId),
          ).toBeVisible()
        }
      },
    )
  }
})

// ---------------------------------------------------------------------------
// 12. Main content region
// ---------------------------------------------------------------------------
test.describe('Main content region', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'main content area has correct data-testid',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-main-content'),
      ).toBeVisible()
    },
  )

  test(
    'each page renders inside the main content area',
    async ({ page }) => {
      for (const [path, testId] of [
        [
          '/super-admin/tenants',
          'super-admin-tenants-page',
        ],
        [
          '/super-admin/users',
          'super-admin-users-page',
        ],
        [
          '/super-admin/settings',
          'super-admin-settings-page',
        ],
      ] as [string, string][]) {
        await page.goto(path)
        const main = page.getByTestId(
          'super-admin-main-content',
        )
        await expect(main).toBeVisible()
        await expect(
          main.getByTestId(testId),
        ).toBeVisible()
      }
    },
  )
})

// ---------------------------------------------------------------------------
// 13. Direct URL access — unauthenticated
// ---------------------------------------------------------------------------
test.describe('Direct URL access — unauthenticated', () => {
  const PROTECTED = [
    '/super-admin',
    '/super-admin/tenants',
    '/super-admin/users',
    '/super-admin/settings',
  ]

  for (const path of PROTECTED) {
    test(
      `${path} shows Access Denied without a session`,
      async ({ page }) => {
        await page.goto(path)
        await page
          .locator(
            '[data-testid="super-admin-denied"],'
            + '[data-testid="super-admin-dashboard-title"]',
          )
          .first()
          .waitFor({ state: 'visible', timeout: 10_000 })

        await expect(
          page.getByTestId('super-admin-denied'),
        ).toBeVisible()
        await expect(
          page.getByTestId('super-admin-denied'),
        ).toContainText('Access Denied')
      },
    )
  }
})
