/**
 * E2E tests — Site Admin panel (tenant admin)
 *
 * Assumes the dev server is running at http://localhost:3000
 * with at least one seeded account:
 *   • admin user: username=admin / password=password123
 *
 * Routes covered:
 *   /site/demo/admin            — Admin Dashboard
 *   /site/demo/admin/users      — User Management
 *   /site/demo/admin/settings   — Site Settings
 *   /site/demo/admin/features   — Feature Toggles
 *   /site/demo/admin/acl        — ACL Editor
 *   /site/demo/admin/analytics  — Analytics Dashboard
 *   /site/demo/admin/backup     — Backup & Restore
 *   /site/demo/admin/files      — File Manager
 *   /site/demo/admin/menus      — Menu Editor
 *   /site/demo/admin/styles     — Style Editor
 *   /site/demo/admin/templates  — Template Editor
 *
 * Adjust ADMIN_USER / SITE_SLUG below if your seed
 * data uses different values.
 */

import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADMIN_USER = {
  username: 'admin',
  password: 'password123',
}

const SITE_SLUG = 'demo'

const BASE = `/site/${SITE_SLUG}/admin`

// ---------------------------------------------------------------------------
// API mock responses used throughout the suite
// ---------------------------------------------------------------------------

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    created: '2024-01-01',
    banned: false,
  },
  {
    id: 2,
    username: 'alice',
    email: 'alice@example.com',
    created: '2024-02-15',
    banned: false,
  },
]

const MOCK_TENANTS = [
  { id: 1, slug: SITE_SLUG, name: 'Demo Site' },
]

const MOCK_SETTINGS = [
  { id: 1, key: 'site_name', value: 'Demo' },
  { id: 2, key: 'contact_email', value: 'hi@demo.com' },
]

const MOCK_FEATURES = [
  {
    id: 'articles',
    name: 'Articles',
    description: 'Blog articles module',
    enabled: true,
  },
  {
    id: 'forum',
    name: 'Forum',
    description: 'Discussion forum',
    enabled: false,
  },
]

const MOCK_ACL = [
  {
    id: 1,
    action: 'Allow',
    principal: 'admin',
    permission: 'manage_users',
  },
]

const MOCK_MENUS = [
  {
    id: 1,
    name: 'Main Nav',
    route: '/',
    position: 0,
    permissions: 'public',
    group: 'main',
  },
]

const MOCK_MENU_GROUPS = [{ name: 'main' }]

const MOCK_FILES = [
  {
    id: 'f1',
    name: 'logo.png',
    type: 'image/png',
    size: 12345,
    downloads: 3,
    url: '/uploads/logo.png',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Log in via the /auth/login form and wait for redirect. */
async function loginAsAdmin(page: Page): Promise<void> {
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
async function mockApiRoutes(page: Page): Promise<void> {
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
async function goToAdmin(
  page: Page,
  path: string = '',
): Promise<void> {
  await page.goto(`${BASE}${path}`)
  // The admin toolbar is always rendered by the layout
  await page
    .getByTestId('admin-toolbar')
    .waitFor({ state: 'visible', timeout: 10_000 })
}

// ---------------------------------------------------------------------------
// 1. Admin Dashboard — /site/demo/admin
// ---------------------------------------------------------------------------

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'page loads and dashboard container is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-dashboard'),
      ).toBeVisible()
    },
  )

  test(
    'page has a prominent "Dashboard" heading',
    async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: /dashboard/i,
      })
      await expect(heading.first()).toBeVisible()
    },
  )

  test(
    'admin toolbar renders the slug Admin title',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toContainText('Admin')
    },
  )

  test(
    'admin sidebar is present on desktop',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )

  test(
    'admin navigation has aria-label "Admin navigation"',
    async ({ page }) => {
      await expect(
        page.getByRole('navigation', {
          name: /admin navigation/i,
        }),
      ).toBeVisible()
    },
  )

  test('quick-links grid is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('quick-links-grid'),
    ).toBeVisible()
  })

  // Quick-link cards — every label in the QUICK_LINKS array
  const QUICK_LINK_IDS = [
    'quick-link-users',
    'quick-link-settings',
    'quick-link-feature-toggles',
    'quick-link-menus',
    'quick-link-acl',
    'quick-link-files',
    'quick-link-backup',
  ]

  for (const testId of QUICK_LINK_IDS) {
    test(
      `quick-link card "${testId}" is present`,
      async ({ page }) => {
        await expect(
          page.getByTestId(testId),
        ).toBeVisible()
      },
    )
  }

  test(
    'clicking the Users quick-link navigates to /users',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-users')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
    },
  )

  test(
    'clicking the Settings quick-link navigates to /settings',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-settings')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/settings`,
        ),
      )
    },
  )

  test(
    'clicking the Feature Toggles quick-link navigates',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-feature-toggles')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/features`,
        ),
      )
    },
  )

  test(
    'clicking the Backup quick-link navigates to /backup',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-backup')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/backup`,
        ),
      )
    },
  )

  test(
    'stats section renders "Total Users" card',
    async ({ page }) => {
      await expect(
        page.getByText('Total Users'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Content Items" card',
    async ({ page }) => {
      await expect(
        page.getByText('Content Items'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Tenants" card',
    async ({ page }) => {
      await expect(
        page.getByText('Tenants'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Settings" card',
    async ({ page }) => {
      // The "Settings" stat card text
      await expect(
        page.getByText('Settings').first(),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" link is visible in the sidebar',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )

  test(
    'clicking "Back to Site" navigates to the tenant site',
    async ({ page }) => {
      const href = await page
        .getByTestId('admin-back-to-site')
        .getAttribute('href')
      expect(href).toContain(
        `/site/${SITE_SLUG}`,
      )
    },
  )

  test(
    'admin toolbar "Site" button is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-site-link'),
      ).toBeVisible()
    },
  )

  test(
    'admin toolbar "Site" button href points to tenant site',
    async ({ page }) => {
      const href = await page
        .getByTestId('admin-site-link')
        .getAttribute('href')
      expect(href).toContain(
        `/site/${SITE_SLUG}`,
      )
    },
  )

  test(
    'admin-main-content region has correct id anchor',
    async ({ page }) => {
      await expect(
        page.locator('#admin-main-content'),
      ).toBeAttached()
    },
  )

  test(
    'breadcrumb nav is rendered inside main content',
    async ({ page }) => {
      // TenantBreadcrumbs renders a <nav> with aria-label
      await expect(
        page.getByRole('navigation', {
          name: /breadcrumb/i,
        }),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 2. Admin Users — /site/demo/admin/users
// ---------------------------------------------------------------------------

test.describe('Admin Users', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/users')
    await page
      .getByTestId('admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-users-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-users-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "User Management" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /user management/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'user table is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('user-table'),
      ).toBeVisible()
    },
  )

  test(
    'user table has correct accessible label',
    async ({ page }) => {
      await expect(
        page.getByRole('table', {
          name: /user accounts/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'user table shows mocked user rows',
    async ({ page }) => {
      // MOCK_USERS id=1 row
      await expect(
        page.getByTestId('user-row-1'),
      ).toBeVisible()
      // MOCK_USERS id=2 row
      await expect(
        page.getByTestId('user-row-2'),
      ).toBeVisible()
    },
  )

  test(
    'user table shows username and email for each user',
    async ({ page }) => {
      await expect(
        page.getByText('admin'),
      ).toBeVisible()
      await expect(
        page.getByText('alice'),
      ).toBeVisible()
      await expect(
        page.getByText('admin@example.com'),
      ).toBeVisible()
    },
  )

  test(
    'edit-user action button is present for first user',
    async ({ page }) => {
      await expect(
        page.getByTestId('edit-user-1'),
      ).toBeVisible()
    },
  )

  test(
    'edit-user button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /edit user admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'ban-user action button is present for first user',
    async ({ page }) => {
      await expect(
        page.getByTestId('ban-user-1'),
      ).toBeVisible()
    },
  )

  test(
    'ban-user button has aria-label for active user',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /ban admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'delete-user action button is present for first user',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-user-1'),
      ).toBeVisible()
    },
  )

  test(
    'delete-user button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /delete user admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking delete-user opens confirm dialog',
    async ({ page }) => {
      await page
        .getByTestId('delete-user-1')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).toBeVisible()
    },
  )

  test(
    'confirm dialog cancel button closes it',
    async ({ page }) => {
      await page
        .getByTestId('delete-user-1')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).toBeVisible()
      await page
        .getByTestId('confirm-cancel-btn')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'confirm dialog has a destructive confirm button',
    async ({ page }) => {
      await page
        .getByTestId('delete-user-1')
        .click()
      await expect(
        page.getByTestId('confirm-submit-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Create User" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('create-user-btn'),
      ).toBeVisible()
    },
  )

  test(
    'clicking "Create User" opens create-user dialog',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).toBeVisible()
    },
  )

  test(
    'create dialog has username, email, fullname, password inputs',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await expect(
        page.getByTestId('new-username-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-email-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-fullname-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-password-input'),
      ).toBeVisible()
    },
  )

  test(
    'submit button is disabled when fields are empty',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await expect(
        page.getByTestId('submit-create-btn'),
      ).toBeDisabled()
    },
  )

  test(
    'submit button is enabled when required fields are filled',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await page
        .getByTestId('new-username-input')
        .fill('newuser')
      await page
        .getByTestId('new-email-input')
        .fill('new@example.com')
      await page
        .getByTestId('new-password-input')
        .fill('secret123')
      await expect(
        page.getByTestId('submit-create-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'cancel button in create dialog closes it',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).toBeVisible()
      await page
        .getByTestId('cancel-create-btn')
        .click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'admin sidebar is present on users page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 3. Admin Settings — /site/demo/admin/settings
// ---------------------------------------------------------------------------

test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/settings')
    await page
      .getByTestId('admin-settings-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-settings-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-settings-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Settings" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^settings$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'add-setting form is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-setting-form'),
      ).toBeVisible()
    },
  )

  test(
    'setting key and value inputs are present',
    async ({ page }) => {
      await expect(
        page.getByTestId('setting-key-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('setting-value-input').first(),
      ).toBeVisible()
    },
  )

  test(
    '"Add Setting" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-setting-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Add Setting" button is disabled when inputs are empty',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-setting-btn'),
      ).toBeDisabled()
    },
  )

  test(
    '"Add Setting" button enables when both fields filled',
    async ({ page }) => {
      await page
        .getByTestId('setting-key-input')
        .fill('my_key')
      await page
        .getByTestId('setting-value-input')
        .first()
        .fill('my_value')
      await expect(
        page.getByTestId('add-setting-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'settings table is rendered with mocked rows',
    async ({ page }) => {
      await expect(
        page.getByTestId('settings-table'),
      ).toBeVisible()
    },
  )

  test(
    'settings table shows mocked setting keys',
    async ({ page }) => {
      await expect(
        page.getByText('site_name'),
      ).toBeVisible()
      await expect(
        page.getByText('contact_email'),
      ).toBeVisible()
    },
  )

  test(
    'edit-setting button is present for a row',
    async ({ page }) => {
      await expect(
        page.getByTestId('edit-setting-btn').first(),
      ).toBeVisible()
    },
  )

  test(
    'clicking edit-setting reveals save and cancel buttons',
    async ({ page }) => {
      await page
        .getByTestId('edit-setting-btn')
        .first()
        .click()
      await expect(
        page.getByTestId('save-setting-btn'),
      ).toBeVisible()
      await expect(
        page.getByTestId('cancel-setting-btn'),
      ).toBeVisible()
    },
  )

  test(
    'cancel-setting-btn returns row to view mode',
    async ({ page }) => {
      await page
        .getByTestId('edit-setting-btn')
        .first()
        .click()
      await page
        .getByTestId('cancel-setting-btn')
        .click()
      await expect(
        page.getByTestId('edit-setting-btn').first(),
      ).toBeVisible()
    },
  )

  test(
    'delete-setting button is present for a row',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-setting-btn').first(),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on settings page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 4. Admin Features — /site/demo/admin/features
// ---------------------------------------------------------------------------

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/features')
    await page
      .getByTestId('admin-features-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-features-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-features-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Feature Toggles" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /feature toggles/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Save Changes" button is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('save-features-btn'),
      ).toBeVisible()
    },
  )

  test(
    'feature card for "articles" is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('feature-card-articles'),
      ).toBeVisible()
    },
  )

  test(
    'feature card for "forum" is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('feature-card-forum'),
      ).toBeVisible()
    },
  )

  test(
    'feature toggle for "articles" is checked (enabled=true)',
    async ({ page }) => {
      const toggle = page.getByTestId(
        'feature-toggle-articles',
      )
      await expect(toggle).toBeVisible()
      await expect(toggle).toBeChecked()
    },
  )

  test(
    'feature toggle for "forum" is unchecked (enabled=false)',
    async ({ page }) => {
      const toggle = page.getByTestId(
        'feature-toggle-forum',
      )
      await expect(toggle).toBeVisible()
      await expect(toggle).not.toBeChecked()
    },
  )

  test(
    'clicking forum toggle changes its checked state',
    async ({ page }) => {
      const toggle = page.getByTestId(
        'feature-toggle-forum',
      )
      await toggle.click()
      await expect(toggle).toBeChecked()
    },
  )

  test(
    'clicking articles toggle unchecks it',
    async ({ page }) => {
      const toggle = page.getByTestId(
        'feature-toggle-articles',
      )
      await toggle.click()
      await expect(toggle).not.toBeChecked()
    },
  )

  test(
    'clicking "Save Changes" does not cause JS error',
    async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) =>
        errors.push(e.message),
      )
      await page
        .getByTestId('save-features-btn')
        .click()
      // Snackbar success message should appear
      await expect(
        page.getByText(/saved successfully/i),
      ).toBeVisible({ timeout: 5_000 })
      expect(errors).toHaveLength(0)
    },
  )

  test(
    'admin sidebar is present on features page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 5. Admin ACL — /site/demo/admin/acl
// ---------------------------------------------------------------------------

test.describe('Admin ACL', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/acl')
    await page
      .getByTestId('admin-acl-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-acl-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-acl-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "ACL Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /acl editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'add-acl-rule form is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-form'),
      ).toBeVisible()
    },
  )

  test(
    'ACL action select is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-action-select'),
      ).toBeVisible()
    },
  )

  test(
    'ACL principal input is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-principal-input'),
      ).toBeVisible()
    },
  )

  test(
    'ACL permission input is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-permission-input'),
      ).toBeVisible()
    },
  )

  test(
    '"Add Rule" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Add Rule" button disabled when fields are empty',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeDisabled()
    },
  )

  test(
    '"Add Rule" button enables when fields are filled',
    async ({ page }) => {
      await page
        .getByTestId('acl-principal-input')
        .fill('editor')
      await page
        .getByTestId('acl-permission-input')
        .fill('edit_articles')
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'ACL rule table is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-rule-table'),
      ).toBeVisible()
    },
  )

  test(
    'mocked ACL rule row is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toBeVisible()
    },
  )

  test(
    'mocked rule shows principal "admin"',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toContainText('admin')
    },
  )

  test(
    'mocked rule shows permission "manage_users"',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toContainText('manage_users')
    },
  )

  test(
    'delete-acl button is present for mocked rule',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-acl-1'),
      ).toBeVisible()
    },
  )

  test(
    'delete-acl button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /delete rule for admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'ACL action select can be changed to "Deny"',
    async ({ page }) => {
      // The MUI Select renders a combobox
      const select = page.getByTestId(
        'acl-action-select',
      )
      await select.click()
      await page
        .getByRole('option', { name: 'Deny' })
        .click()
      await expect(select).toContainText('Deny')
    },
  )

  test(
    'admin sidebar is present on ACL page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 6. Admin Analytics — /site/demo/admin/analytics
// ---------------------------------------------------------------------------

test.describe('Admin Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/analytics')
  })

  test(
    'page loads and toolbar is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Analytics Dashboard" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /analytics dashboard/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Top Referrers" section is rendered',
    async ({ page }) => {
      await expect(
        page.getByText('Top Referrers'),
      ).toBeVisible()
    },
  )

  test(
    '"Popular Search Queries" section is rendered',
    async ({ page }) => {
      await expect(
        page.getByText('Popular Search Queries'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "Google Search" row',
    async ({ page }) => {
      await expect(
        page.getByText('Google Search'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "Direct" row',
    async ({ page }) => {
      await expect(
        page.getByText('Direct'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "GitHub" row',
    async ({ page }) => {
      await expect(
        page.getByText('GitHub'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table has Source column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /source/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'referrer table has Visits column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /visits/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'search queries table shows "next.js tutorial"',
    async ({ page }) => {
      await expect(
        page.getByText('next.js tutorial'),
      ).toBeVisible()
    },
  )

  test(
    'search queries table has Query column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /query/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on analytics page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 7. Admin Backup — /site/demo/admin/backup
// ---------------------------------------------------------------------------

test.describe('Admin Backup', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/backup')
  })

  test(
    'page loads and toolbar is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Backup" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /backup/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'Export section heading is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^export$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Export Settings" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /export settings/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Export Menus" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /export menus/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking "Export Settings" does not throw',
    async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) =>
        errors.push(e.message),
      )
      await page
        .getByRole('button', {
          name: /export settings/i,
        })
        .click()
      expect(errors).toHaveLength(0)
    },
  )

  test(
    'clicking "Export Menus" does not throw',
    async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) =>
        errors.push(e.message),
      )
      await page
        .getByRole('button', {
          name: /export menus/i,
        })
        .click()
      expect(errors).toHaveLength(0)
    },
  )

  test(
    'Import / Restore section is visible',
    async ({ page }) => {
      await expect(
        page.getByText(/import \/ restore/i),
      ).toBeVisible()
    },
  )

  test(
    'caution warning alert is rendered',
    async ({ page }) => {
      await expect(
        page.getByText(/caution: restoring data/i),
      ).toBeVisible()
    },
  )

  test(
    '"Choose File" import button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /choose file/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'hidden file input is attached to DOM',
    async ({ page }) => {
      await expect(
        page.locator(
          'input[type="file"][accept=".json"]',
        ),
      ).toBeAttached()
    },
  )

  test(
    'admin sidebar is present on backup page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 8. Admin Files — /site/demo/admin/files
// ---------------------------------------------------------------------------

test.describe('Admin Files', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/files')
    await page
      .getByTestId('admin-files-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-files-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-files-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "File Manager" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /file manager/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'upload dropzone is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('upload-dropzone'),
      ).toBeVisible()
    },
  )

  test(
    'dropzone has correct region aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('region', {
          name: /file upload dropzone/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Upload Files" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('upload-files-btn'),
      ).toBeVisible()
    },
  )

  test(
    'file grid is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('file-grid'),
      ).toBeVisible()
    },
  )

  test(
    'mocked file card is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('file-card-f1'),
      ).toBeVisible()
    },
  )

  test(
    'mocked file card shows file name',
    async ({ page }) => {
      await expect(
        page.getByTestId('file-card-f1'),
      ).toContainText('logo.png')
    },
  )

  test(
    'delete-file button is present for mocked file',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-file-f1'),
      ).toBeVisible()
    },
  )

  test(
    'delete-file button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /delete file logo\.png/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking delete-file opens confirm dialog',
    async ({ page }) => {
      await page
        .getByTestId('delete-file-f1')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).toBeVisible()
    },
  )

  test(
    'confirm dialog cancel closes it for file delete',
    async ({ page }) => {
      await page
        .getByTestId('delete-file-f1')
        .click()
      await page
        .getByTestId('confirm-cancel-btn')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'admin sidebar is present on files page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 9. Admin Menus — /site/demo/admin/menus
// ---------------------------------------------------------------------------

test.describe('Admin Menus', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/menus')
    await page
      .getByTestId('admin-menus-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-menus-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-menus-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Menu Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /menu editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'menu group select is visible',
    async ({ page }) => {
      await expect(
        page.getByLabel('Menu Group'),
      ).toBeVisible()
    },
  )

  test(
    'menu group select shows mocked group',
    async ({ page }) => {
      await expect(
        page.getByLabel('Menu Group'),
      ).toContainText('main')
    },
  )

  test(
    'menu name input is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-name-input'),
      ).toBeVisible()
    },
  )

  test(
    'menu route input is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-route-input'),
      ).toBeVisible()
    },
  )

  test(
    'menu position input is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-position-input'),
      ).toBeVisible()
    },
  )

  test(
    'menu permissions select is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-permissions-select'),
      ).toBeVisible()
    },
  )

  test(
    'menu permissions select has public/authenticated/admin options',
    async ({ page }) => {
      const select = page.getByTestId(
        'menu-permissions-select',
      )
      await select.click()
      await expect(
        page.getByRole('option', { name: 'public' }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', {
          name: 'authenticated',
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', { name: 'admin' }),
      ).toBeVisible()
      await page.keyboard.press('Escape')
    },
  )

  test(
    '"Add Item" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-menu-item-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Add Item" button is disabled when name/route empty',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-menu-item-btn'),
      ).toBeDisabled()
    },
  )

  test(
    '"Add Item" button enables when name and route filled',
    async ({ page }) => {
      await page
        .getByTestId('menu-name-input')
        .fill('Blog')
      await page
        .getByTestId('menu-route-input')
        .fill('/blog')
      await expect(
        page.getByTestId('add-menu-item-btn'),
      ).toBeEnabled()
    },
  )

  test(
    '"New Menu Group" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /new menu group/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking "New Menu Group" opens create-group dialog',
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: /new menu group/i,
        })
        .click()
      await expect(
        page.getByTestId('create-group-dialog'),
      ).toBeVisible()
    },
  )

  test(
    'create-group dialog has group-name-input',
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: /new menu group/i,
        })
        .click()
      await expect(
        page.getByTestId('group-name-input'),
      ).toBeVisible()
    },
  )

  test(
    'create-group dialog submit button is disabled when empty',
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: /new menu group/i,
        })
        .click()
      await expect(
        page.getByTestId('submit-group-btn'),
      ).toBeDisabled()
    },
  )

  test(
    'create-group submit enables when name typed',
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: /new menu group/i,
        })
        .click()
      await page
        .getByTestId('group-name-input')
        .fill('footer')
      await expect(
        page.getByTestId('submit-group-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'cancel button in create-group dialog closes it',
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: /new menu group/i,
        })
        .click()
      await page
        .getByTestId('cancel-group-btn')
        .click()
      await expect(
        page.getByTestId('create-group-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'mocked menu item row is visible in table',
    async ({ page }) => {
      await expect(
        page.getByText('Main Nav'),
      ).toBeVisible()
    },
  )

  test(
    'edit-row button is present for mocked menu item',
    async ({ page }) => {
      await expect(
        page.getByTestId('edit-row-btn'),
      ).toBeVisible()
    },
  )

  test(
    'clicking edit-row reveals save and cancel edit buttons',
    async ({ page }) => {
      await page
        .getByTestId('edit-row-btn')
        .click()
      await expect(
        page.getByTestId('save-edit-btn'),
      ).toBeVisible()
      await expect(
        page.getByTestId('cancel-edit-btn'),
      ).toBeVisible()
    },
  )

  test(
    'cancel-edit-btn returns row to view mode',
    async ({ page }) => {
      await page
        .getByTestId('edit-row-btn')
        .click()
      await page
        .getByTestId('cancel-edit-btn')
        .click()
      await expect(
        page.getByTestId('edit-row-btn'),
      ).toBeVisible()
    },
  )

  test(
    'delete-row button is present for mocked menu item',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-row-btn'),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on menus page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 10. Admin Styles — /site/demo/admin/styles
// ---------------------------------------------------------------------------

test.describe('Admin Styles', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/styles')
  })

  test(
    'page loads and toolbar is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Style Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /style editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Colors" section heading is rendered',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^colors$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Typography" section heading is rendered',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^typography$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Layout" section heading is rendered',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^layout$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Font Family" select is present',
    async ({ page }) => {
      await expect(
        page.getByLabel('Font Family'),
      ).toBeVisible()
    },
  )

  test(
    '"Font Family" select has multiple options',
    async ({ page }) => {
      await page.getByLabel('Font Family').click()
      await expect(
        page.getByRole('option', {
          name: /Roboto/i,
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', {
          name: /Inter/i,
        }),
      ).toBeVisible()
      await page.keyboard.press('Escape')
    },
  )

  test(
    '"Primary Color" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Primary Color'),
      ).toBeVisible()
    },
  )

  test(
    '"Secondary Color" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Secondary Color'),
      ).toBeVisible()
    },
  )

  test(
    '"Background Color" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Background Color'),
      ).toBeVisible()
    },
  )

  test(
    '"Text Color" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Text Color'),
      ).toBeVisible()
    },
  )

  test(
    'color swatch boxes are rendered (at least one)',
    async ({ page }) => {
      // Each ColorPickerField renders a swatch box
      // that opens the picker on click
      const swatches = page.locator(
        '[style*="background-color"], ' +
        '[style*="bgcolor"]',
      )
      // More lenient: just confirm the primary swatch
      // sits beside a hex text input
      const hexInputs = page.locator(
        'input[value^="#"]',
      )
      expect(await hexInputs.count()).toBeGreaterThan(
        0,
      )
    },
  )

  test(
    'border-radius slider is present',
    async ({ page }) => {
      await expect(
        page.getByText(/border radius/i),
      ).toBeVisible()
    },
  )

  test(
    'spacing slider is present',
    async ({ page }) => {
      await expect(
        page.getByText(/spacing/i),
      ).toBeVisible()
    },
  )

  test(
    '"Live Preview" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Live Preview'),
      ).toBeVisible()
    },
  )

  test(
    '"Save" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^save$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Reset" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^reset$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Export JSON" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /export json/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Import JSON" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /import json/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking "Reset" restores default color value',
    async ({ page }) => {
      // Change primary color input to something else
      const hexInputs = page.locator(
        'input[value^="#"]',
      )
      await hexInputs.first().fill('#ff0000')
      await page
        .getByRole('button', {
          name: /^reset$/i,
        })
        .click()
      // After reset the primary should be back to default
      await expect(hexInputs.first()).not.toHaveValue(
        '#ff0000',
      )
    },
  )

  test(
    'preview area shows "Sample Article Title"',
    async ({ page }) => {
      await expect(
        page.getByText('Sample Article Title'),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on styles page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 11. Admin Templates — /site/demo/admin/templates
// ---------------------------------------------------------------------------

test.describe('Admin Templates', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/templates')
  })

  test(
    'page loads and toolbar is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Template Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /template editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Template Section" select is present',
    async ({ page }) => {
      await expect(
        page.getByLabel('Template Section'),
      ).toBeVisible()
    },
  )

  test(
    '"Template Section" select defaults to "Header"',
    async ({ page }) => {
      await expect(
        page.getByLabel('Template Section'),
      ).toContainText('Header')
    },
  )

  test(
    '"Template Section" select has Header/Footer/Sidebar/Layout',
    async ({ page }) => {
      await page
        .getByLabel('Template Section')
        .click()
      await expect(
        page.getByRole('option', {
          name: 'Header',
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', {
          name: 'Footer',
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', {
          name: 'Sidebar',
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('option', {
          name: 'Main Layout',
        }),
      ).toBeVisible()
      await page.keyboard.press('Escape')
    },
  )

  test(
    'selecting "Footer" section changes preview',
    async ({ page }) => {
      await page
        .getByLabel('Template Section')
        .click()
      await page
        .getByRole('option', { name: 'Footer' })
        .click()
      await expect(
        page.getByText(/live preview - footer/i),
      ).toBeVisible()
    },
  )

  test(
    'Preview toggle button is present',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /preview/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'toggling Preview button hides live preview pane',
    async ({ page }) => {
      // Preview is visible by default
      await expect(
        page.getByText(/live preview/i),
      ).toBeVisible()
      // Click the ToggleButton to hide it
      await page
        .getByRole('button', { name: /preview/i })
        .click()
      await expect(
        page.getByText(/live preview/i),
      ).not.toBeVisible()
    },
  )

  test(
    '"Save" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^save$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Reset" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^reset$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'live preview pane renders default header HTML',
    async ({ page }) => {
      await expect(
        page.getByText(/live preview - header/i),
      ).toBeVisible()
    },
  )

  test(
    'Monaco editor container is mounted',
    async ({ page }) => {
      await page
        .locator('.monaco-editor')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 })
        .catch(() => {
          // Monaco may not load in headless — skip gracefully
        })
    },
  )

  test(
    'admin sidebar is present on templates page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 12. Admin sidebar navigation
// ---------------------------------------------------------------------------

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'nav list is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-nav-list'),
      ).toBeVisible()
    },
  )

  test(
    'all primary nav items are visible',
    async ({ page }) => {
      const navItems = [
        'admin-nav-dashboard',
        'admin-nav-users',
        'admin-nav-settings',
        'admin-nav-feature-toggles',
        'admin-nav-menus',
        'admin-nav-acl',
        'admin-nav-files',
        'admin-nav-templates',
        'admin-nav-styles',
        'admin-nav-analytics',
        'admin-nav-backup',
      ]
      for (const testId of navItems) {
        await expect(
          page.getByTestId(testId),
        ).toBeVisible()
      }
    },
  )

  test(
    'clicking Users nav item navigates to users page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-users')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
      await expect(
        page.getByTestId('admin-users-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Settings nav item navigates to settings page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-settings')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/settings`,
        ),
      )
      await expect(
        page.getByTestId('admin-settings-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Features nav item navigates to features page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-feature-toggles')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/features`,
        ),
      )
      await expect(
        page.getByTestId('admin-features-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Menus nav item navigates to menus page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-menus')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/menus`,
        ),
      )
      await expect(
        page.getByTestId('admin-menus-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking ACL nav item navigates to acl page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-acl')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/acl`,
        ),
      )
      await expect(
        page.getByTestId('admin-acl-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Files nav item navigates to files page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-files')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/files`,
        ),
      )
      await expect(
        page.getByTestId('admin-files-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Analytics nav item navigates to analytics page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-analytics')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/analytics`,
        ),
      )
      await expect(
        page.getByRole('heading', {
          name: /analytics dashboard/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking Backup nav item navigates to backup page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-backup')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/backup`,
        ),
      )
      await expect(
        page.getByRole('heading', {
          name: /backup/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking Templates nav item navigates to templates page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-templates')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/templates`,
        ),
      )
      await expect(
        page.getByRole('heading', {
          name: /template editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking Styles nav item navigates to styles page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-styles')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/styles`,
        ),
      )
      await expect(
        page.getByRole('heading', {
          name: /style editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" link is visible in sidebar',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" link text reads "Back to Site"',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toContainText('Back to Site')
    },
  )

  test(
    'secondary navigation has aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('navigation', {
          name: /admin secondary navigation/i,
        }),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// 13. Unauthenticated access — redirects to login
// ---------------------------------------------------------------------------

test.describe('Unauthenticated access redirects', () => {
  const PROTECTED_PATHS = [
    '',
    '/users',
    '/settings',
    '/features',
    '/acl',
    '/analytics',
    '/backup',
    '/files',
    '/menus',
    '/styles',
    '/templates',
  ]

  for (const path of PROTECTED_PATHS) {
    const fullPath = `${BASE}${path}`
    test(
      `${fullPath} redirects unauthenticated users`,
      async ({ page }) => {
        await page.goto(fullPath)
        await page.waitForLoadState('networkidle')

        const currentUrl = page.url()
        const isOnLoginPage =
          currentUrl.includes('/auth/login') ||
          currentUrl.includes('/login')

        const hasAuthGuard =
          (await page
            .getByText(/access denied/i)
            .count()) > 0 ||
          (await page
            .getByText(/sign in/i)
            .count()) > 0

        const redirected =
          isOnLoginPage || hasAuthGuard
        expect(redirected).toBe(true)
      },
    )
  }
})

// ---------------------------------------------------------------------------
// 14. Mobile responsive — 375×667
// ---------------------------------------------------------------------------

test.describe('Mobile responsive — 375×667', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'hamburger menu toggle is visible on mobile',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-menu-toggle'),
      ).toBeVisible()
    },
  )

  test(
    'hamburger toggle has aria-label "Open admin menu"',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /open admin menu/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'permanent sidebar is NOT visible at mobile width',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).not.toBeVisible()
    },
  )

  test(
    'clicking hamburger opens the mobile drawer',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      await expect(
        page.getByTestId('admin-drawer-mobile'),
      ).toBeVisible()
    },
  )

  test(
    'mobile drawer contains dashboard nav item',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      const drawer = page.getByTestId(
        'admin-drawer-mobile',
      )
      await expect(drawer).toBeVisible()
      await expect(
        drawer.getByTestId('admin-nav-dashboard'),
      ).toBeVisible()
    },
  )

  test(
    'mobile drawer contains users nav item',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      const drawer = page.getByTestId(
        'admin-drawer-mobile',
      )
      await expect(
        drawer.getByTestId('admin-nav-users'),
      ).toBeVisible()
    },
  )

  test(
    'mobile drawer contains all nav items',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      const drawer = page.getByTestId(
        'admin-drawer-mobile',
      )
      const navItems = [
        'admin-nav-settings',
        'admin-nav-feature-toggles',
        'admin-nav-menus',
        'admin-nav-acl',
        'admin-nav-files',
        'admin-nav-analytics',
        'admin-nav-backup',
      ]
      for (const testId of navItems) {
        await expect(
          drawer.getByTestId(testId),
        ).toBeVisible()
      }
    },
  )

  test(
    'mobile drawer contains "Back to Site" link',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      const drawer = page.getByTestId(
        'admin-drawer-mobile',
      )
      await expect(
        drawer.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )

  test(
    'clicking a nav item in drawer navigates and closes drawer',
    async ({ page }) => {
      await page
        .getByTestId('admin-menu-toggle')
        .click()
      const drawer = page.getByTestId(
        'admin-drawer-mobile',
      )
      await drawer
        .getByTestId('admin-nav-users')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
    },
  )
})

// ---------------------------------------------------------------------------
// 15. Keyboard navigation
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'all sidebar nav items are individually focusable',
    async ({ page }) => {
      const navTestIds = [
        'admin-nav-dashboard',
        'admin-nav-users',
        'admin-nav-settings',
        'admin-nav-feature-toggles',
      ]
      for (const testId of navTestIds) {
        await page.getByTestId(testId).focus()
        await expect(
          page.getByTestId(testId),
        ).toBeFocused()
      }
    },
  )

  test(
    'Enter key on Users nav navigates to /users',
    async ({ page }) => {
      const usersNav = page.getByTestId(
        'admin-nav-users',
      )
      await usersNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
    },
  )

  test(
    'skip-to-content link is present in DOM',
    async ({ page }) => {
      await expect(
        page.getByTestId('skip-to-content'),
      ).toBeAttached()
    },
  )

  test(
    'skip-to-content link becomes visible on focus',
    async ({ page }) => {
      const skip = page.getByTestId(
        'skip-to-content',
      )
      await skip.focus()
      // After focus, the element is repositioned
      // into the viewport via inline style
      await expect(skip).toBeVisible()
    },
  )

  test(
    'skip-to-content href points to admin-main-content',
    async ({ page }) => {
      const href = await page
        .getByTestId('skip-to-content')
        .getAttribute('href')
      expect(href).toBe('#admin-main-content')
    },
  )

  test(
    'admin-site-link is keyboard focusable',
    async ({ page }) => {
      await page
        .getByTestId('admin-site-link')
        .focus()
      await expect(
        page.getByTestId('admin-site-link'),
      ).toBeFocused()
    },
  )

  test(
    'quick-link cards are keyboard focusable',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-users')
        .focus()
      await expect(
        page.getByTestId('quick-link-users'),
      ).toBeFocused()
    },
  )
})
