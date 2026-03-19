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
  await page.getByTestId('username-input').fill(credentials.username)
  // PasswordField wraps the native input; target by aria-label
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(credentials.password)
  await page.getByTestId('login-submit').click()
  // Wait for redirect away from /auth/login
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 10_000,
  })
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

// ---------------------------------------------------------------------------
// 1. Access denied — unauthenticated
// ---------------------------------------------------------------------------
test.describe('Access denied — unauthenticated', () => {
  test('shows Access Denied without a login session', async ({ page }) => {
    await goToSuperAdmin(page)

    const denied = page.getByTestId('super-admin-denied')
    await expect(denied).toBeVisible()
    await expect(denied).toContainText('Access Denied')
  })
})

// ---------------------------------------------------------------------------
// 2. Access denied — regular user (role < 4)
// ---------------------------------------------------------------------------
test.describe('Access denied — regular user', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, REGULAR_USER)
  })

  test(
    'regular user (role < SuperAdmin) is blocked from /super-admin',
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

  test('shows Platform Overview dashboard', async ({ page }) => {
    await goToSuperAdmin(page)

    await expect(
      page.getByTestId('super-admin-dashboard-title'),
    ).toBeVisible()
    await expect(
      page.getByTestId('super-admin-dashboard-title'),
    ).toHaveText('Platform Overview')
  })

  test('sidebar contains all primary nav links', async ({ page }) => {
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
  })

  test('quick-action cards are rendered', async ({ page }) => {
    await goToSuperAdmin(page)

    await expect(page.getByTestId('quick-tenants')).toBeVisible()
    await expect(page.getByTestId('quick-users')).toBeVisible()
    await expect(page.getByTestId('quick-settings')).toBeVisible()
    await expect(page.getByTestId('quick-create-site')).toBeVisible()
  })
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

  test('shows "Tenants" heading and "New Site" button', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Tenants' }),
    ).toBeVisible()
    await expect(page.getByTestId('new-tenant-button')).toBeVisible()
    await expect(page.getByTestId('new-tenant-button')).toContainText(
      'New Site',
    )
  })

  test('"New Site" button links to /create-site', async ({ page }) => {
    const btn = page.getByTestId('new-tenant-button')
    await expect(btn).toHaveAttribute('href', '/create-site')
  })

  test('tenant management table is rendered', async ({ page }) => {
    // Wait for the loading spinner to disappear (if any)
    await page
      .locator('[aria-label="Loading tenants"]')
      .waitFor({ state: 'detached', timeout: 10_000 })
      .catch(() => {/* already gone — safe to ignore */})

    await expect(
      page.getByTestId('tenant-management-table'),
    ).toBeVisible()
  })

  test(
    'at least one tenant-row-* is visible when tenants exist',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading tenants"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const rows = page.locator('[data-testid^="tenant-row-"]')
      const count = await rows.count()

      if (count === 0) {
        // No tenants seeded — verify empty-state text instead
        await expect(
          page.getByText('No tenants found.'),
        ).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  test(
    'clicking delete opens confirmation dialog',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading tenants"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      await deleteButtons.first().click()

      const dialog = page.getByTestId('tenant-delete-dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog).toContainText('Delete Tenant?')
    },
  )

  test(
    'cancel in delete dialog closes it without removing row',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading tenants"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      // Capture the slug of the first row before opening dialog
      const firstRow = page.locator('[data-testid^="tenant-row-"]').first()
      const testId = await firstRow.getAttribute('data-testid') ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page.getByTestId('cancel-delete-tenant').click()

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
    'tenant filter input narrows visible rows',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading tenants"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const rows = page.locator('[data-testid^="tenant-row-"]')
      const count = await rows.count()
      if (count === 0) {
        test.skip()
        return
      }

      // Type a string that matches nothing
      const filterInput = page.getByTestId('tenant-filter-input')
      await filterInput.fill('__nonexistent_tenant__')
      await expect(page.getByText('No tenants found.')).toBeVisible()

      // Clear filter — rows come back
      await filterInput.clear()
      await expect(rows.first()).toBeVisible()
    },
  )

  test(
    'confirm delete removes tenant from the list',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading tenants"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      const firstRow = page.locator('[data-testid^="tenant-row-"]').first()
      const testId = await firstRow.getAttribute('data-testid') ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page.getByTestId('confirm-delete-tenant').click()

      // Dialog closes and the row disappears
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      await expect(
        page.getByTestId(`tenant-row-${slug}`),
      ).not.toBeVisible()
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

  test('shows "Global Users" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Global Users' }),
    ).toBeVisible()
  })

  test('global users table is rendered', async ({ page }) => {
    await page
      .locator('[aria-label="Loading users"]')
      .waitFor({ state: 'detached', timeout: 10_000 })
      .catch(() => {})

    await expect(page.getByTestId('global-users-table')).toBeVisible()
  })

  test(
    'at least one user-row-* is visible',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading users"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const rows = page.locator('[data-testid^="user-row-"]')
      const count = await rows.count()

      if (count === 0) {
        await expect(page.getByText('No users found.')).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  test(
    'role select dropdowns are present for each user',
    async ({ page }) => {
      await page
        .locator('[aria-label="Loading users"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const roleSelects = page.locator('[data-testid^="role-select-"]')
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
      await page
        .locator('[aria-label="Loading users"]')
        .waitFor({ state: 'detached', timeout: 10_000 })
        .catch(() => {})

      const roleSelects = page.locator('[data-testid^="role-select-"]')
      if ((await roleSelects.count()) === 0) {
        test.skip()
        return
      }

      // Open the first select
      await roleSelects.first().click()

      const options = page.getByRole('option')
      await expect(options.filter({ hasText: 'Guest' })).toBeVisible()
      await expect(options.filter({ hasText: 'User' })).toBeVisible()
      await expect(options.filter({ hasText: 'Moderator' })).toBeVisible()
      await expect(options.filter({ hasText: 'Site Admin' })).toBeVisible()
      await expect(options.filter({ hasText: 'Super Admin' })).toBeVisible()

      // Close the menu without making a change
      await page.keyboard.press('Escape')
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

  test('Tenants nav item navigates to /super-admin/tenants', async ({
    page,
  }) => {
    await page.getByTestId('super-admin-nav-tenants').click()
    await expect(page).toHaveURL(/\/super-admin\/tenants/)
    await expect(
      page.getByTestId('super-admin-tenants-page'),
    ).toBeVisible()
  })

  test('Users nav item navigates to /super-admin/users', async ({
    page,
  }) => {
    await page.getByTestId('super-admin-nav-users').click()
    await expect(page).toHaveURL(/\/super-admin\/users/)
    await expect(
      page.getByTestId('super-admin-users-page'),
    ).toBeVisible()
  })

  test('Settings nav item navigates to /super-admin/settings', async ({
    page,
  }) => {
    await page.getByTestId('super-admin-nav-settings').click()
    await expect(page).toHaveURL(/\/super-admin\/settings/)
    await expect(
      page.getByTestId('super-admin-settings-page'),
    ).toBeVisible()
  })

  test('Dashboard nav item navigates back to /super-admin', async ({
    page,
  }) => {
    // Go somewhere else first
    await page.goto('/super-admin/users')
    await page.getByTestId('super-admin-nav-dashboard').click()
    await expect(page).toHaveURL(/\/super-admin$/)
    await expect(
      page.getByTestId('super-admin-dashboard-title'),
    ).toBeVisible()
  })

  test('"Back to Portal" link navigates to /', async ({ page }) => {
    await page.getByTestId('super-admin-back-portal').click()
    await expect(page).toHaveURL('/')
  })

  test('settings page shows Platform Settings heading', async ({ page }) => {
    await page.goto('/super-admin/settings')
    await expect(
      page.getByRole('heading', { name: 'Platform Settings' }),
    ).toBeVisible()
  })
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
    'all sidebar nav items are reachable and activatable via keyboard',
    async ({ page }) => {
      // Focus the sidebar nav list region
      const navList = page.getByTestId('super-admin-nav-list')
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

  test('Enter key on Tenants nav activates the link', async ({ page }) => {
    const tenantsNav = page.getByTestId('super-admin-nav-tenants')
    await tenantsNav.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/super-admin\/tenants/)
  })

  test('Tab order: Dashboard → Tenants → Users → Settings', async ({
    page,
  }) => {
    const dashboard = page.getByTestId('super-admin-nav-dashboard')
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
  })
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

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await expect(
      page.getByTestId('super-admin-menu-toggle'),
    ).toBeVisible()
  })

  test(
    'clicking hamburger opens drawer with nav items',
    async ({ page }) => {
      await page.getByTestId('super-admin-menu-toggle').click()

      const drawer = page.getByTestId('super-admin-drawer-mobile')
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
    'clicking a nav item in the drawer closes it and navigates',
    async ({ page }) => {
      await page.getByTestId('super-admin-menu-toggle').click()

      const drawer = page.getByTestId('super-admin-drawer-mobile')
      await expect(drawer).toBeVisible()

      await drawer.getByTestId('super-admin-nav-tenants').click()

      await expect(page).toHaveURL(/\/super-admin\/tenants/)
      // Drawer should auto-close after nav click (onNavClick → onClose)
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
// Additional coverage: AppBar toolbar
// ---------------------------------------------------------------------------
test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test('super admin toolbar is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('super-admin-toolbar'),
    ).toBeVisible()
  })

  test('toolbar displays "PyraCMS Super Admin" title', async ({ page }) => {
    await expect(
      page.getByTestId('super-admin-toolbar'),
    ).toContainText('PyraCMS Super Admin')
  })
})

// ---------------------------------------------------------------------------
// Additional coverage: main content region
// ---------------------------------------------------------------------------
test.describe('Main content region', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test('main content area has correct data-testid', async ({ page }) => {
    await expect(
      page.getByTestId('super-admin-main-content'),
    ).toBeVisible()
  })

  test('each page renders inside the main content area', async ({ page }) => {
    for (const [path, testId] of [
      ['/super-admin/tenants', 'super-admin-tenants-page'],
      ['/super-admin/users', 'super-admin-users-page'],
      ['/super-admin/settings', 'super-admin-settings-page'],
    ] as [string, string][]) {
      await page.goto(path)
      const main = page.getByTestId('super-admin-main-content')
      await expect(main).toBeVisible()
      await expect(main.getByTestId(testId)).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Additional coverage: direct URL access by unauthenticated user
// ---------------------------------------------------------------------------
test.describe('Direct URL access — unauthenticated', () => {
  const PROTECTED = [
    '/super-admin',
    '/super-admin/tenants',
    '/super-admin/users',
    '/super-admin/settings',
  ]

  for (const path of PROTECTED) {
    test(`${path} shows Access Denied without a session`, async ({ page }) => {
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
    })
  }
})
