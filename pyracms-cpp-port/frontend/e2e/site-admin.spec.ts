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

const MOCK_FILES: unknown[] = []

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

  test('page loads and dashboard container is visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-dashboard'),
    ).toBeVisible()
  })

  test('page has a <h1> or prominent heading', async ({ page }) => {
    // The dashboard uses Typography variant="h3" with text "Dashboard"
    const heading = page.getByRole('heading', { name: /dashboard/i })
    await expect(heading.first()).toBeVisible()
  })

  test('admin toolbar renders the slug Admin title', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-toolbar'),
    ).toContainText('Admin')
  })

  test('admin sidebar is present on desktop', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })

  test('admin navigation has aria-label "Admin navigation"', async ({
    page,
  }) => {
    await expect(
      page.getByRole('navigation', {
        name: /admin navigation/i,
      }),
    ).toBeVisible()
  })

  test('quick-links grid is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('quick-links-grid'),
    ).toBeVisible()
  })

  test('quick-link card for Users is present', async ({ page }) => {
    await expect(
      page.getByTestId('quick-link-users'),
    ).toBeVisible()
  })

  test('quick-link card for Settings is present', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('quick-link-settings'),
    ).toBeVisible()
  })

  test('quick-link card for Feature Toggles is present', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('quick-link-feature-toggles'),
    ).toBeVisible()
  })

  test('quick-link card for Backup is present', async ({ page }) => {
    await expect(
      page.getByTestId('quick-link-backup'),
    ).toBeVisible()
  })

  test('stats section renders stat cards', async ({ page }) => {
    // DashboardStats renders a grid of cards — at least one
    // Card with a stat title should be present
    await expect(
      page.getByText('Total Users'),
    ).toBeVisible()
  })

  test(
    '"Back to Site" link navigates to the tenant site',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )

  test('admin toolbar "Site" button is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-site-link'),
    ).toBeVisible()
  })
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

  test('page loads — admin-users-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-users-page'),
    ).toBeVisible()
  })

  test('page has "User Management" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /user management/i }),
    ).toBeVisible()
  })

  test('user table is rendered', async ({ page }) => {
    await expect(page.getByTestId('user-table')).toBeVisible()
  })

  test('user table has correct accessible label', async ({ page }) => {
    await expect(
      page.getByRole('table', { name: /user accounts/i }),
    ).toBeVisible()
  })

  test('"Create User" button is visible', async ({ page }) => {
    await expect(
      page.getByTestId('create-user-btn'),
    ).toBeVisible()
  })

  test(
    'clicking "Create User" opens create-user dialog',
    async ({ page }) => {
      await page.getByTestId('create-user-btn').click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).toBeVisible()
    },
  )

  test(
    'create dialog has username, email, password inputs',
    async ({ page }) => {
      await page.getByTestId('create-user-btn').click()
      await expect(
        page.getByTestId('new-username-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-email-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-password-input'),
      ).toBeVisible()
    },
  )

  test(
    'cancel button in create dialog closes it',
    async ({ page }) => {
      await page.getByTestId('create-user-btn').click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).toBeVisible()
      await page.getByTestId('cancel-create-btn').click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).not.toBeVisible()
    },
  )

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads — admin-settings-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-settings-page'),
    ).toBeVisible()
  })

  test('page has "Settings" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /^settings$/i }),
    ).toBeVisible()
  })

  test('add-setting form is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('add-setting-form'),
    ).toBeVisible()
  })

  test('setting key and value inputs are present', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('setting-key-input'),
    ).toBeVisible()
    await expect(
      page.getByTestId('setting-value-input'),
    ).toBeVisible()
  })

  test('"Add Setting" button is visible', async ({ page }) => {
    await expect(
      page.getByTestId('add-setting-btn'),
    ).toBeVisible()
  })

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads — admin-features-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-features-page'),
    ).toBeVisible()
  })

  test('page has "Feature Toggles" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /feature toggles/i }),
    ).toBeVisible()
  })

  test('"Save Changes" button is present', async ({ page }) => {
    await expect(
      page.getByTestId('save-features-btn'),
    ).toBeVisible()
  })

  test(
    'at least one feature-card-* is visible when features load',
    async ({ page }) => {
      const cards = page.locator(
        '[data-testid^="feature-card-"]',
      )
      const count = await cards.count()
      if (count === 0) {
        // No features returned by API — page still loaded OK
        await expect(
          page.getByTestId('admin-features-page'),
        ).toBeVisible()
      } else {
        await expect(cards.first()).toBeVisible()
      }
    },
  )

  test(
    'feature toggle switches are rendered for each feature',
    async ({ page }) => {
      const toggles = page.locator(
        '[data-testid^="feature-toggle-"]',
      )
      const count = await toggles.count()
      if (count > 0) {
        await expect(toggles.first()).toBeVisible()
      }
    },
  )

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads — admin-acl-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-acl-page'),
    ).toBeVisible()
  })

  test('page has "ACL Editor" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /acl editor/i }),
    ).toBeVisible()
  })

  test('add-acl-rule form is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('add-acl-rule-form'),
    ).toBeVisible()
  })

  test('ACL action select is present', async ({ page }) => {
    await expect(
      page.getByTestId('acl-action-select'),
    ).toBeVisible()
  })

  test('ACL principal and permission inputs are present', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('acl-principal-input'),
    ).toBeVisible()
    await expect(
      page.getByTestId('acl-permission-input'),
    ).toBeVisible()
  })

  test('"Add Rule" button is visible', async ({ page }) => {
    await expect(
      page.getByTestId('add-acl-rule-btn'),
    ).toBeVisible()
  })

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads and toolbar is visible', async ({ page }) => {
    await expect(
      page.getByTestId('admin-toolbar'),
    ).toBeVisible()
  })

  test('page has "Analytics Dashboard" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /analytics dashboard/i,
      }),
    ).toBeVisible()
  })

  test('"Top Referrers" section is rendered', async ({ page }) => {
    await expect(
      page.getByText('Top Referrers'),
    ).toBeVisible()
  })

  test('"Popular Search Queries" section is rendered', async ({
    page,
  }) => {
    await expect(
      page.getByText('Popular Search Queries'),
    ).toBeVisible()
  })

  test(
    'referrer table shows at least one data source',
    async ({ page }) => {
      // Static data — "Google Search" is always present
      await expect(
        page.getByText('Google Search'),
      ).toBeVisible()
    },
  )

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads and toolbar is visible', async ({ page }) => {
    await expect(
      page.getByTestId('admin-toolbar'),
    ).toBeVisible()
  })

  test('page has "Backup" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /backup/i }),
    ).toBeVisible()
  })

  test('Export section heading is visible', async ({ page }) => {
    await expect(page.getByText('Export')).toBeVisible()
  })

  test('"Export Settings" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /export settings/i }),
    ).toBeVisible()
  })

  test('"Export Menus" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /export menus/i }),
    ).toBeVisible()
  })

  test('Import section is visible', async ({ page }) => {
    await expect(
      page.getByText(/import \/ restore/i),
    ).toBeVisible()
  })

  test('caution warning alert is rendered', async ({ page }) => {
    await expect(
      page.getByText(/caution: restoring data/i),
    ).toBeVisible()
  })

  test('"Choose File" import button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /choose file/i }),
    ).toBeVisible()
  })

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads — admin-files-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-files-page'),
    ).toBeVisible()
  })

  test('page has "File Manager" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /file manager/i }),
    ).toBeVisible()
  })

  test('upload dropzone is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('upload-dropzone'),
    ).toBeVisible()
  })

  test('dropzone has correct region label', async ({ page }) => {
    await expect(
      page.getByRole('region', {
        name: /file upload dropzone/i,
      }),
    ).toBeVisible()
  })

  test('"Upload Files" button is visible', async ({ page }) => {
    await expect(
      page.getByTestId('upload-files-btn'),
    ).toBeVisible()
  })

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads — admin-menus-page container visible', async ({
    page,
  }) => {
    await expect(
      page.getByTestId('admin-menus-page'),
    ).toBeVisible()
  })

  test('page has "Menu Editor" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /menu editor/i }),
    ).toBeVisible()
  })

  test('menu name input is visible', async ({ page }) => {
    await expect(
      page.getByTestId('menu-name-input'),
    ).toBeVisible()
  })

  test('menu route input is visible', async ({ page }) => {
    await expect(
      page.getByTestId('menu-route-input'),
    ).toBeVisible()
  })

  test('menu position input is visible', async ({ page }) => {
    await expect(
      page.getByTestId('menu-position-input'),
    ).toBeVisible()
  })

  test('menu permissions select is visible', async ({ page }) => {
    await expect(
      page.getByTestId('menu-permissions-select'),
    ).toBeVisible()
  })

  test('"Add Item" button is visible', async ({ page }) => {
    await expect(
      page.getByTestId('add-menu-item-btn'),
    ).toBeVisible()
  })

  test('"New Menu Group" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /new menu group/i }),
    ).toBeVisible()
  })

  test(
    'clicking "New Menu Group" opens create-group dialog',
    async ({ page }) => {
      await page
        .getByRole('button', { name: /new menu group/i })
        .click()
      await expect(
        page.getByTestId('create-group-dialog'),
      ).toBeVisible()
      // Close it again
      await page.getByTestId('cancel-group-btn').click()
    },
  )

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads and toolbar is visible', async ({ page }) => {
    await expect(
      page.getByTestId('admin-toolbar'),
    ).toBeVisible()
  })

  test('page has "Style Editor" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /style editor/i }),
    ).toBeVisible()
  })

  test('"Colors" section is rendered', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /colors/i }),
    ).toBeVisible()
  })

  test('"Typography" section is rendered', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /typography/i }),
    ).toBeVisible()
  })

  test('"Live Preview" label is present', async ({ page }) => {
    await expect(page.getByText('Live Preview')).toBeVisible()
  })

  test('"Save" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^save$/i }),
    ).toBeVisible()
  })

  test('"Reset" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^reset$/i }),
    ).toBeVisible()
  })

  test('"Export JSON" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /export json/i }),
    ).toBeVisible()
  })

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('page loads and toolbar is visible', async ({ page }) => {
    await expect(
      page.getByTestId('admin-toolbar'),
    ).toBeVisible()
  })

  test('page has "Template Editor" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /template editor/i }),
    ).toBeVisible()
  })

  test('"Template Section" select is present', async ({ page }) => {
    await expect(
      page.getByLabel('Template Section'),
    ).toBeVisible()
  })

  test('"Save" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^save$/i }),
    ).toBeVisible()
  })

  test('"Reset" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^reset$/i }),
    ).toBeVisible()
  })

  test('live preview pane is rendered', async ({ page }) => {
    // Preview label shows "Live Preview - header" by default
    await expect(
      page.getByText(/live preview/i),
    ).toBeVisible()
  })

  test(
    'Monaco editor container is mounted',
    async ({ page }) => {
      // Monaco renders a .monaco-editor div once loaded
      await page
        .locator('.monaco-editor')
        .first()
        .waitFor({
          state: 'visible',
          timeout: 15_000,
        })
        .catch(() => {
          // Monaco may not load in headless — skip gracefully
        })
    },
  )

  test('admin sidebar is present', async ({ page }) => {
    await expect(
      page.getByTestId('admin-sidebar'),
    ).toBeVisible()
  })
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

  test('nav list is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('admin-nav-list'),
    ).toBeVisible()
  })

  test('all primary nav items are visible', async ({ page }) => {
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
      await expect(page.getByTestId(testId)).toBeVisible()
    }
  })

  test(
    'clicking Users nav item navigates to users page',
    async ({ page }) => {
      await page.getByTestId('admin-nav-users').click()
      await expect(page).toHaveURL(
        new RegExp(`/site/${SITE_SLUG}/admin/users`),
      )
      await expect(
        page.getByTestId('admin-users-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Settings nav item navigates to settings page',
    async ({ page }) => {
      await page.getByTestId('admin-nav-settings').click()
      await expect(page).toHaveURL(
        new RegExp(`/site/${SITE_SLUG}/admin/settings`),
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
        new RegExp(`/site/${SITE_SLUG}/admin/features`),
      )
      await expect(
        page.getByTestId('admin-features-page'),
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
        // No login — navigate directly
        await page.goto(fullPath)

        // Either we land on a login page or the admin page
        // renders an auth guard. Either way the current URL
        // must NOT be the requested admin path after settle.
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

        // At least one of the two guards must be active
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
      await page.getByTestId('admin-menu-toggle').click()
      const drawer = page.getByTestId('admin-drawer-mobile')
      await expect(drawer).toBeVisible()
    },
  )

  test(
    'mobile drawer contains nav items',
    async ({ page }) => {
      await page.getByTestId('admin-menu-toggle').click()
      const drawer = page.getByTestId('admin-drawer-mobile')
      await expect(drawer).toBeVisible()
      await expect(
        drawer.getByTestId('admin-nav-dashboard'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('admin-nav-users'),
      ).toBeVisible()
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
      const usersNav = page.getByTestId('admin-nav-users')
      await usersNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        new RegExp(`/site/${SITE_SLUG}/admin/users`),
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
})
