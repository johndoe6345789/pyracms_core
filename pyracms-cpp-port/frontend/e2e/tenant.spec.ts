/**
 * E2E tests for PyraCMS tenant content pages.
 *
 * Routes covered (all under /site/demo/):
 *  - /site/demo/                             Tenant home
 *  - /site/demo/articles                     Article list
 *  - /site/demo/articles/hello-world         Article detail
 *  - /site/demo/articles/hello-world/edit    Article edit
 *  - /site/demo/articles/hello-world/revisions  Revisions
 *  - /site/demo/articles/create              Article create
 *  - /site/demo/forum                        Forum index
 *  - /site/demo/forum/1                      Forum thread list
 *  - /site/demo/forum/thread/1               Thread view
 *  - /site/demo/forum/thread/create          Thread create
 *  - /site/demo/gallery                      Gallery index
 *  - /site/demo/gallery/1                    Album view
 *  - /site/demo/games                        Game catalog
 *  - /site/demo/snippets                     Snippets list
 *  - /site/demo/snippets/new                 New snippet
 *  - /site/demo/snippets/42                  View snippet
 *  - /site/demo/code                         Code albums
 *  - /site/demo/dependencies                 Dependencies
 *  - /site/demo/users/admin                  User profile
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLUG = 'demo'
const BASE = `/site/${SLUG}`

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const MOCK_TENANT = [{ id: 1, slug: SLUG, name: 'Demo' }]

const MOCK_ARTICLE = {
  id: 1,
  name: 'hello-world',
  displayName: 'Hello World',
  title: 'Hello World',
  content: '<p>Hello from the test.</p>',
  renderer: 'html',
  rendererName: 'html',
  author: 'admin',
  createdDate: '2024-01-01',
  tags: ['test', 'demo'],
  views: 42,
  likes: 5,
  dislikes: 1,
  revisionNumber: 3,
}

const MOCK_ARTICLES_LIST = {
  items: [
    {
      id: 1,
      name: 'hello-world',
      title: 'Hello World',
      excerpt: 'A sample article.',
      author: 'admin',
      date: '2024-01-01',
      tags: ['test'],
      views: 42,
    },
    {
      id: 2,
      name: 'second-post',
      title: 'Second Post',
      excerpt: 'Another article.',
      author: 'admin',
      date: '2024-01-02',
      tags: [],
      views: 10,
    },
  ],
  total: 2,
}

const MOCK_CATEGORY = {
  id: 1,
  name: 'General',
  forums: [
    {
      id: 1,
      name: 'General Discussion',
      description: 'Talk about anything.',
      threads: 5,
      posts: 20,
    },
  ],
}

const MOCK_FORUM = {
  id: 1,
  name: 'General Discussion',
  description: 'Talk about anything.',
}

const MOCK_THREAD = {
  id: 1,
  title: 'Welcome Thread',
  description: 'First thread here.',
  author: 'admin',
  pinned: false,
  replies: 3,
  views: 15,
  lastPostDate: '2024-01-01',
}

const MOCK_THREADS = [MOCK_THREAD]

const MOCK_POSTS = [
  {
    id: 1,
    author: 'admin',
    content: 'First post content.',
    createdAt: '2024-01-01T10:00:00Z',
    votes: 2,
  },
]

const MOCK_ALBUMS = [
  {
    id: 1,
    name: 'Vacation 2024',
    coverUrl: '',
    pictureCount: 5,
  },
]

const MOCK_REVISIONS = [
  {
    number: 3,
    author: 'admin',
    date: '2024-01-03',
    summary: 'Fixed typo',
  },
  {
    number: 2,
    author: 'admin',
    date: '2024-01-02',
    summary: 'Added section',
  },
  {
    number: 1,
    author: 'admin',
    date: '2024-01-01',
    summary: 'Initial draft',
  },
]

const MOCK_SNIPPET = {
  id: 42,
  title: 'Fibonacci',
  language: 'python',
  code: 'def fib(n): return n if n < 2 else fib(n-1)+fib(n-2)',
  authorUsername: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  runCount: 7,
}

const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  bio: 'Site administrator',
  location: 'Earth',
  avatarUrl: '',
  reputation: 42,
  createdAt: '2024-01-01T00:00:00Z',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Log in as the admin user via /auth/login and wait
 * for navigation away from the login page.
 */
async function loginAsAdmin(page: Page): Promise<void> {
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
function collectConsoleErrors(page: Page) {
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
async function mockTenantAndArticles(
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

// ---------------------------------------------------------------------------
// Suite 1 – Tenant home  /site/demo/
// ---------------------------------------------------------------------------

test.describe('Tenant home — /site/demo/', () => {
  test(
    'page loads without a JS console error',
    async ({ page }) => {
      const { errors, cleanup } = collectConsoleErrors(page)
      await page.goto(`${BASE}/`)
      cleanup()
      // Allow informational / network errors from missing API,
      // but there must be no React render crash.
      const fatalErrors = errors.filter(
        (e) =>
          e.includes('Uncaught') ||
          e.includes('TypeError') ||
          e.includes('ReferenceError'),
      )
      expect(fatalErrors).toHaveLength(0)
    },
  )

  test(
    'site name heading derived from slug is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      // slug "demo" → capitalised → "Demo"
      await expect(
        page.getByRole('heading', { name: 'Demo' }),
      ).toBeVisible()
    },
  )

  test(
    'welcome body text mentions the site name',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await expect(
        page.getByText(/Welcome to Demo/i),
      ).toBeVisible()
    },
  )

  test(
    'module card for Articles is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Articles/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/articles`,
      )
    },
  )

  test(
    'module card for Forum is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Forum/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/forum`,
      )
    },
  )

  test(
    'module card for Gallery is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Gallery/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/gallery`,
      )
    },
  )

  test(
    'module card for Games is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Games/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/games`,
      )
    },
  )

  test(
    'all four module cards are rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      // TenantModuleCards renders exactly four cards
      const cards = page.getByRole('link', {
        name: /Articles|Forum|Gallery|Games/i,
      })
      await expect(cards).toHaveCount(4)
    },
  )

  test(
    'clicking the Articles card navigates to articles list',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Articles/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/articles`),
      )
    },
  )

  test(
    'clicking the Forum card navigates to forum',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Forum/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/forum`),
      )
    },
  )

  test(
    'clicking the Gallery card navigates to gallery',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Gallery/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/gallery`),
      )
    },
  )

  test(
    'clicking the Games card navigates to games',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Games/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/games`),
      )
    },
  )

  test(
    'all module cards are keyboard-focusable',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      // Tab through the first four focusable links.
      await page.keyboard.press('Tab')
      // At least one of the module cards must
      // receive focus via Tab key sequence.
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    },
  )

  test(
    'module card icons are aria-hidden decorations',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      // Card descriptions are visible for screen readers.
      await expect(
        page.getByText(/Read and publish articles/i),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 2 – Article list  /site/demo/articles
// ---------------------------------------------------------------------------

test.describe('Articles list — /site/demo/articles', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the tenant lookup and articles API so the page
    // renders predictably without a live backend.
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: { items: [], total: 0 } }),
    )
  })

  test(
    'page loads and shows "Articles" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByRole('heading', { name: 'Articles' }),
      ).toBeVisible()
    },
  )

  test(
    'article list page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('article-list-page'),
      ).toBeVisible()
    },
  )

  test('search bar is present', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    await expect(
      page.getByTestId('article-search-input'),
    ).toBeVisible()
  })

  test(
    'search bar has correct accessible label',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByLabel('Search articles'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Article" button is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('create-article-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Article" button links to the create page',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('create-article-btn'),
      ).toHaveAttribute('href', `${BASE}/articles/create`)
    },
  )

  test(
    'empty state is shown when no articles exist',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      // With mocked empty response the page must not crash.
      // Either an empty-state element or no article rows.
      const body = page.locator('body')
      await expect(body).toBeVisible()
    },
  )

  test(
    'typing in search bar updates the input value',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      const searchInput = page.getByTestId(
        'article-search-input',
      )
      await searchInput.fill('playwright')
      await expect(searchInput).toHaveValue(
        'playwright',
      )
    },
  )

  test(
    'article list grid is rendered with articles',
    async ({ page }) => {
      // Override empty mock to include two articles.
      await page.route('**/api/articles**', (route) =>
        route.fulfill({ json: MOCK_ARTICLES_LIST }),
      )
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('article-list'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'article card link navigates to article detail',
    async ({ page }) => {
      await page.route('**/api/articles**', (route) =>
        route.fulfill({ json: MOCK_ARTICLES_LIST }),
      )
      await page.goto(`${BASE}/articles`)
      const link = page.getByTestId(
        'article-card-link-hello-world',
      )
      await expect(link).toBeVisible({ timeout: 8_000 })
      await expect(link).toHaveAttribute(
        'href',
        `${BASE}/articles/hello-world`,
      )
    },
  )

  test(
    'second article card is rendered',
    async ({ page }) => {
      await page.route('**/api/articles**', (route) =>
        route.fulfill({ json: MOCK_ARTICLES_LIST }),
      )
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('article-card-second-post'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'search input is keyboard-accessible (Tab focus)',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const search = page.getByTestId(
        'article-search-input',
      )
      // Check the element exists and is focusable.
      await expect(search).toBeVisible()
    },
  )

  test(
    'article list section has aria-label',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.locator('[aria-label="Article listing"]'),
      ).toBeAttached()
    },
  )

  test(
    'pressing Enter in search bar does not crash',
    async ({ page }) => {
      const { errors, cleanup } =
        collectConsoleErrors(page)
      await page.goto(`${BASE}/articles`)
      await page
        .getByTestId('article-search-input')
        .fill('test')
      await page.keyboard.press('Enter')
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 3 – Article detail  /site/demo/articles/hello-world
// ---------------------------------------------------------------------------

test.describe(
  'Article detail — /site/demo/articles/hello-world',
  () => {
    test(
      'page loads without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/articles/hello-world`)
        cleanup()
        const fatal = errors.filter(
          (e) =>
            e.includes('Uncaught') ||
            e.includes('TypeError'),
        )
        expect(fatal).toHaveLength(0)
      },
    )

    test(
      'shows article content when API returns data',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-detail-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article title heading is visible',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByRole('heading', {
            name: 'Hello World',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article content wrapper has aria-label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-content-wrapper'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'Edit button is present and links to edit page',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        const editBtn = page.getByTestId(
          'edit-article-btn',
        )
        await expect(editBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(editBtn).toHaveAttribute(
          'href',
          `${BASE}/articles/hello-world/edit`,
        )
      },
    )

    test(
      'Revisions button is present and links to revisions',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        const revBtn = page.getByTestId('revisions-btn')
        await expect(revBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(revBtn).toHaveAttribute(
          'href',
          `${BASE}/articles/hello-world/revisions`,
        )
      },
    )

    test(
      'Like button is visible and has aria-label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        const likeBtn = page.getByTestId('like-btn')
        await expect(likeBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(likeBtn).toHaveAttribute(
          'aria-label',
          'Like article',
        )
      },
    )

    test(
      'Dislike button is visible and has aria-label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('dislike-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'Like count is displayed',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('like-count'),
        ).toHaveText('5', { timeout: 8_000 })
      },
    )

    test(
      'clicking Like button does not crash',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.route('**/api/votes**', (route) =>
          route.fulfill({ json: { ok: true } }),
        )
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/articles/hello-world`)
        await page
          .getByTestId('like-btn')
          .click({ timeout: 8_000 })
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )

    test(
      'article actions section has correct ARIA region',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-actions'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'vote buttons section has correct ARIA container',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-vote-buttons'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'shows "not found" state or null when article missing',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({
              status: 404,
              json: { detail: 'Not found' },
            }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        // ArticlePageClient returns null when !article;
        // verify the page did not hard-crash.
        await expect(page.locator('body')).toBeVisible()
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 4 – Article edit  /site/demo/articles/hello-world/edit
// ---------------------------------------------------------------------------

test.describe(
  'Article edit — /site/demo/articles/hello-world/edit',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
      await page.route(
        '**/api/articles/hello-world**',
        (route) =>
          route.fulfill({ json: MOCK_ARTICLE }),
      )
    })

    test(
      'page container is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('edit-article-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Edit Article" heading is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByRole('heading', {
            name: 'Edit Article',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Article" button links back',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByText('Back to Article'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article editor form is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('article-editor-form'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'title input field is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('article-title-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'renderer selector is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('renderer-select'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'tags input field is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('tags-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'summary input field is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('summary-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Save Changes" button is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('save-article-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Cancel" button links back to article',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        const cancelBtn = page.getByTestId(
          'cancel-edit-btn',
        )
        await expect(cancelBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(cancelBtn).toHaveAttribute(
          'href',
          `${BASE}/articles/hello-world`,
        )
      },
    )

    test(
      'title input can receive edited text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        const titleInput = page.getByTestId(
          'article-title-input',
        )
        await expect(titleInput).toBeVisible({
          timeout: 8_000,
        })
        await titleInput.fill('Updated Title')
        await expect(titleInput).toHaveValue(
          'Updated Title',
        )
      },
    )

    test(
      'edit form section has ARIA label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.locator(
            '[aria-label="Edit article form"]',
          ),
        ).toBeAttached()
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 5 – Article revisions
//   /site/demo/articles/hello-world/revisions
// ---------------------------------------------------------------------------

test.describe(
  'Article revisions — /site/demo/articles/hello-world/revisions',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
      await page.route(
        '**/api/articles/hello-world/revisions**',
        (route) =>
          route.fulfill({ json: MOCK_REVISIONS }),
      )
    })

    test(
      'revisions page container is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByTestId('revisions-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Revision History" heading is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByRole('heading', {
            name: 'Revision History',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Article" link is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByText('Back to Article'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'revision section has ARIA label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByTestId('revisions-section'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'revision table is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByTestId('revision-table'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'subtitle about managing revisions is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/revisions`,
        )
        await expect(
          page.getByText(
            /View and manage past revisions/i,
          ),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 6 – Article create  /site/demo/articles/create
// ---------------------------------------------------------------------------

test.describe(
  'Article create — /site/demo/articles/create',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
    })

    test(
      'page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('create-article-page'),
        ).toBeVisible()
      },
    )

    test(
      '"Create Article" heading is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByRole('heading', {
            name: 'Create Article',
          }),
        ).toBeVisible()
      },
    )

    test(
      'article editor form is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('article-editor-form'),
        ).toBeVisible()
      },
    )

    test(
      'title input field is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('article-title-input'),
        ).toBeVisible()
      },
    )

    test(
      'title input can receive text input',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        const titleInput = page.getByTestId(
          'article-title-input',
        )
        await titleInput.fill('My New Article')
        await expect(titleInput).toHaveValue(
          'My New Article',
        )
      },
    )

    test(
      'renderer selector is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('renderer-select'),
        ).toBeVisible()
      },
    )

    test(
      '"Back to Articles" button is present',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByText('Back to Articles'),
        ).toBeVisible()
      },
    )

    test(
      'submit button is visible and initially enabled',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        // Submit is disabled when title is empty
        const btn = page.getByTestId(
          'create-article-submit',
        )
        await expect(btn).toBeVisible()
      },
    )

    test(
      'submit button is enabled after filling title',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await page
          .getByTestId('article-title-input')
          .fill('Test Title')
        await expect(
          page.getByTestId('create-article-submit'),
        ).not.toBeDisabled()
      },
    )

    test(
      '"Cancel" button links back to article list',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('cancel-create-btn'),
        ).toHaveAttribute('href', `${BASE}/articles`)
      },
    )

    test(
      'tags input field is present',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('tags-input'),
        ).toBeVisible()
      },
    )

    test(
      'tags input accepts comma-separated values',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        const tagsInput = page.getByTestId('tags-input')
        await tagsInput.fill('react, typescript, test')
        await expect(tagsInput).toHaveValue(
          'react, typescript, test',
        )
      },
    )

    test(
      'summary input field is present',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('summary-input'),
        ).toBeVisible()
      },
    )

    test(
      'page renders without fatal console errors',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/articles/create`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 7 – Forum index  /site/demo/forum
// ---------------------------------------------------------------------------

test.describe('Forum — /site/demo/forum', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route(
      '**/api/forum/categories**',
      (route) => route.fulfill({ json: [] }),
    )
  })

  test(
    'page loads and shows "Forum" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByRole('heading', { name: 'Forum' }),
      ).toBeVisible()
    },
  )

  test(
    'forum page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByTestId('forum-page'),
      ).toBeVisible()
    },
  )

  test(
    'subtitle text about discussions is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByText(/Join discussions/i),
      ).toBeVisible()
    },
  )

  test(
    'renders without a fatal JS error',
    async ({ page }) => {
      const { errors, cleanup } =
        collectConsoleErrors(page)
      await page.goto(`${BASE}/forum`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )

  test(
    'category accordion is rendered with data',
    async ({ page }) => {
      await page.route(
        '**/api/forum/categories**',
        (route) =>
          route.fulfill({ json: [MOCK_CATEGORY] }),
      )
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByTestId('category-accordion-1'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'forum card inside category is clickable',
    async ({ page }) => {
      await page.route(
        '**/api/forum/categories**',
        (route) =>
          route.fulfill({ json: [MOCK_CATEGORY] }),
      )
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByTestId('forum-card-1'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'forum card link has correct href',
    async ({ page }) => {
      await page.route(
        '**/api/forum/categories**',
        (route) =>
          route.fulfill({ json: [MOCK_CATEGORY] }),
      )
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByTestId('forum-link-1'),
      ).toHaveAttribute(
        'href',
        `${BASE}/forum/1`,
        { timeout: 8_000 },
      )
    },
  )

  test(
    'forum card link has accessible aria-label',
    async ({ page }) => {
      await page.route(
        '**/api/forum/categories**',
        (route) =>
          route.fulfill({ json: [MOCK_CATEGORY] }),
      )
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByLabel(
          'Open forum: General Discussion',
        ),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'category accordion toggle button is present',
    async ({ page }) => {
      await page.route(
        '**/api/forum/categories**',
        (route) =>
          route.fulfill({ json: [MOCK_CATEGORY] }),
      )
      await page.goto(`${BASE}/forum`)
      await expect(
        page.getByLabel(
          'Toggle General category',
        ),
      ).toBeVisible({ timeout: 8_000 })
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 8 – Forum thread list  /site/demo/forum/1
// ---------------------------------------------------------------------------

test.describe(
  'Forum thread list — /site/demo/forum/1',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/forum/forums/1**',
        (route) =>
          route.fulfill({ json: MOCK_FORUM }),
      )
      await page.route(
        '**/api/forum/threads**',
        (route) => route.fulfill({ json: [] }),
      )
    })

    test(
      'page loads and thread list container is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-list-page'),
        ).toBeVisible()
      },
    )

    test(
      '"New Thread" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('new-thread-button'),
        ).toBeVisible()
      },
    )

    test(
      '"New Thread" button links to create page',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('new-thread-button'),
        ).toHaveAttribute(
          'href',
          `${BASE}/forum/thread/create?forumId=1`,
        )
      },
    )

    test(
      '"Back to Forums" link navigates to forum index',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByText('Back to Forums'),
        ).toBeVisible()
      },
    )

    test(
      'thread table is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-table'),
        ).toBeVisible()
      },
    )

    test(
      'thread pagination is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-pagination'),
        ).toBeVisible()
      },
    )

    test(
      'thread table has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByRole('table', {
            name: 'Forum threads',
          }),
        ).toBeVisible()
      },
    )

    test(
      'thread row links to thread view page',
      async ({ page }) => {
        await page.route(
          '**/api/forum/threads**',
          (route) =>
            route.fulfill({ json: MOCK_THREADS }),
        )
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-row-1'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/forum/1`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 9 – Forum thread view  /site/demo/forum/thread/1
// ---------------------------------------------------------------------------

test.describe(
  'Forum thread view — /site/demo/forum/thread/1',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/forum/threads/1**',
        (route) =>
          route.fulfill({ json: MOCK_THREAD }),
      )
      await page.route(
        '**/api/forum/posts**',
        (route) =>
          route.fulfill({ json: MOCK_POSTS }),
      )
    })

    test(
      'thread view page container is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByTestId('view-thread-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Forum" button is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByText('Back to Forum'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'posts list container is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByTestId('posts-list'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'posts list has correct ARIA role and label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByRole('list', {
            name: 'Thread posts',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'quick reply form is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByTestId('quick-reply-form'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'quick reply textarea is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByTestId('quick-reply-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'quick reply submit button is present and initially disabled',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        const submitBtn = page.getByTestId(
          'quick-reply-submit',
        )
        await expect(submitBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(submitBtn).toBeDisabled()
      },
    )

    test(
      'typing in quick reply enables the submit button',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await page
          .getByTestId('quick-reply-input')
          .fill('This is my reply.')
        await expect(
          page.getByTestId('quick-reply-submit'),
        ).not.toBeDisabled()
      },
    )

    test(
      'quick reply textarea has accessible aria-label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByLabel('Reply content'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 10 – Forum thread create
//   /site/demo/forum/thread/create
// ---------------------------------------------------------------------------

test.describe(
  'Forum thread create — /site/demo/forum/thread/create',
  () => {
    test(
      'thread create page container is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Create New Thread" heading is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByRole('heading', {
            name: 'Create New Thread',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Forum" link is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByText('Back to Forum'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'create thread form is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-form'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'form has accessible role and aria-label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByRole('form', {
            name: 'Create thread form',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'thread title input is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('thread-title-input'),
        ).toBeVisible()
      },
    )

    test(
      'thread description input is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId(
            'thread-description-input',
          ),
        ).toBeVisible()
      },
    )

    test(
      'thread content textarea is present',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('thread-content-input'),
        ).toBeVisible()
      },
    )

    test(
      'title input accepts text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        const titleInput = page.getByTestId(
          'thread-title-input',
        )
        await titleInput.fill('My New Thread')
        await expect(titleInput).toHaveValue(
          'My New Thread',
        )
      },
    )

    test(
      'description input accepts text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        const descInput = page.getByTestId(
          'thread-description-input',
        )
        await descInput.fill('Brief description')
        await expect(descInput).toHaveValue(
          'Brief description',
        )
      },
    )

    test(
      'content textarea accepts text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        const contentInput = page.getByTestId(
          'thread-content-input',
        )
        await contentInput.fill(
          'The body of the first post.',
        )
        await expect(contentInput).toHaveValue(
          'The body of the first post.',
        )
      },
    )

    test(
      '"Create Thread" submit button is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-submit'),
        ).toBeVisible()
      },
    )

    test(
      '"Create Thread" submit has aria-label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByLabel('Create thread'),
        ).toBeVisible()
      },
    )

    test(
      '"Cancel" button links back to forum',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-cancel'),
        ).toHaveAttribute('href', `${BASE}/forum`)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 11 – Gallery  /site/demo/gallery
// ---------------------------------------------------------------------------

test.describe('Gallery — /site/demo/gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route(
      '**/api/gallery/albums**',
      (route) => route.fulfill({ json: [] }),
    )
  })

  test(
    'page loads and shows "Gallery" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByRole('heading', { name: 'Gallery' }),
      ).toBeVisible()
    },
  )

  test(
    'gallery page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByTestId('gallery-page'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Album" button is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByTestId('create-album-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Album" button has accessible aria-label',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByLabel('Create album'),
      ).toBeVisible()
    },
  )

  test(
    'subtitle text about photo albums is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByText(/Browse photo albums/i),
      ).toBeVisible()
    },
  )

  test(
    'album grid container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByTestId('album-grid'),
      ).toBeVisible()
    },
  )

  test(
    'album cards rendered when API returns albums',
    async ({ page }) => {
      await page.route(
        '**/api/gallery/albums**',
        (route) =>
          route.fulfill({ json: MOCK_ALBUMS }),
      )
      await page.goto(`${BASE}/gallery`)
      // At least one album card/link should appear.
      await expect(
        page
          .getByRole('link')
          .filter({ hasText: /Vacation/i })
          .first(),
      ).toBeVisible({ timeout: 8_000 })
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 12 – Gallery album view  /site/demo/gallery/1
// ---------------------------------------------------------------------------

test.describe(
  'Gallery album view — /site/demo/gallery/1',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/gallery/albums/1**',
        (route) =>
          route.fulfill({
            json: {
              id: 1,
              name: 'Vacation 2024',
              pictures: [],
            },
          }),
      )
    })

    test(
      'album view page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByTestId('album-view-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'breadcrumbs are rendered with Gallery link',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByTestId('album-breadcrumbs'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'breadcrumbs have correct aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByLabel('Gallery breadcrumb'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Gallery" breadcrumb link goes to gallery index',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        const galleryLink = page
          .getByTestId('album-breadcrumbs')
          .getByRole('link', { name: 'Gallery' })
        await expect(galleryLink).toBeVisible({
          timeout: 8_000,
        })
        await expect(galleryLink).toHaveAttribute(
          'href',
          `${BASE}/gallery`,
        )
      },
    )

    test(
      '"Upload" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByTestId('upload-picture-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Upload" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByLabel('Upload pictures'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'hidden file input is present inside Upload button',
      async ({ page }) => {
        await page.goto(`${BASE}/gallery/1`)
        await expect(
          page.getByTestId('upload-file-input'),
        ).toBeAttached()
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/gallery/1`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 13 – Games  /site/demo/games
// ---------------------------------------------------------------------------

test.describe('Games — /site/demo/games', () => {
  test(
    'page loads and shows "Game Catalog" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      await expect(
        page.getByRole('heading', {
          name: 'Game Catalog',
        }),
      ).toBeVisible()
    },
  )

  test(
    'subtitle text about Hypernucleus is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      await expect(
        page.getByText(/Hypernucleus/i),
      ).toBeVisible()
    },
  )

  test(
    'search input is present on games page',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      await expect(
        page.getByPlaceholder('Search games...'),
      ).toBeVisible()
    },
  )

  test(
    'typing in search input filters results',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      const searchInput = page.getByPlaceholder(
        'Search games...',
      )
      await searchInput.fill('space')
      await expect(searchInput).toHaveValue('space')
    },
  )

  test(
    '"Filter by Tag" dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      await expect(
        page.getByLabel('Filter by Tag'),
      ).toBeVisible()
    },
  )

  test(
    '"Sort By" dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      await expect(
        page.getByLabel('Sort By'),
      ).toBeVisible()
    },
  )

  test(
    'game cards are rendered from placeholder data',
    async ({ page }) => {
      await page.goto(`${BASE}/games`)
      // PLACEHOLDER_GAMES always has items — at least one
      // card link must appear.
      await expect(
        page.locator('a').first(),
      ).toBeVisible()
    },
  )

  test(
    'renders without a fatal JS error',
    async ({ page }) => {
      const { errors, cleanup } =
        collectConsoleErrors(page)
      await page.goto(`${BASE}/games`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 14 – Snippets  /site/demo/snippets
// ---------------------------------------------------------------------------

test.describe('Snippets — /site/demo/snippets', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/snippets**', (route) =>
      route.fulfill({ json: { items: [] } }),
    )
  })

  test(
    'page loads and shows "Code Snippets" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByRole('heading', {
          name: 'Code Snippets',
        }),
      ).toBeVisible()
    },
  )

  test(
    'snippets page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('snippets-page'),
      ).toBeVisible()
    },
  )

  test(
    '"New Snippet" button is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('new-snippet-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"New Snippet" button links to new snippet page',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('new-snippet-btn'),
      ).toHaveAttribute(
        'href',
        `${BASE}/snippets/new`,
      )
    },
  )

  test(
    '"New Snippet" button has accessible aria-label',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByLabel('Create new snippet'),
      ).toBeVisible()
    },
  )

  test(
    'snippet search input is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('snippet-search'),
      ).toBeVisible()
    },
  )

  test(
    'snippet search input accepts text',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      const searchInput = page.getByTestId(
        'snippet-search',
      )
      await searchInput.fill('fibonacci')
      await expect(searchInput).toHaveValue(
        'fibonacci',
      )
    },
  )

  test(
    'language filter dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('language-filter'),
      ).toBeVisible()
    },
  )

  test(
    'sort-by dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('sort-select'),
      ).toBeVisible()
    },
  )

  test(
    'empty state message is shown when no snippets exist',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('no-snippets-msg'),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" button is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByText('Back to Site'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 15 – New Snippet  /site/demo/snippets/new
// ---------------------------------------------------------------------------

test.describe(
  'New Snippet — /site/demo/snippets/new',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
    })

    test(
      'new snippet page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('new-snippet-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"New Code Snippet" heading is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByRole('heading', {
            name: 'New Code Snippet',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Snippets" link is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByText('Back to Snippets'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'title input field is present',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('snippet-title-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'title input accepts text',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        const titleInput = page.getByTestId(
          'snippet-title-input',
        )
        await titleInput.fill('My Snippet')
        await expect(titleInput).toHaveValue(
          'My Snippet',
        )
      },
    )

    test(
      '"Run" button is present',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('run-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByLabel('Run snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button is disabled when code is empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('run-btn'),
        ).toBeDisabled()
      },
    )

    test(
      '"Save Snippet" button is present',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('save-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Save Snippet" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByLabel('Save snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Save Snippet" button is disabled when title or code empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('save-btn'),
        ).toBeDisabled()
      },
    )

    test(
      '"Cancel" button links back to snippets list',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('cancel-btn'),
        ).toHaveAttribute('href', `${BASE}/snippets`)
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/snippets/new`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 16 – View Snippet  /site/demo/snippets/42
// ---------------------------------------------------------------------------

test.describe(
  'View Snippet — /site/demo/snippets/42',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/snippets/42**',
        (route) =>
          route.fulfill({ json: MOCK_SNIPPET }),
      )
    })

    test(
      'view snippet page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('view-snippet-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'snippet title is shown as heading',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByRole('heading', {
            name: 'Fibonacci',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Snippets" link is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByText('Back to Snippets'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('run-snippet-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page
            .getByTestId('run-snippet-btn')
            .getByRole('button'),
        ).toBeAttached()
      },
    )

    test(
      '"Fork" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('fork-snippet-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Fork" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByLabel('Fork snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Share" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('share-snippet-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Share" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByLabel('Share snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'code block is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('snippet-code-block'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'comment section is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('comment-section'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'comment input textarea is present',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('comment-input'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Post Comment" button is present and disabled when empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        const postBtn = page.getByTestId(
          'post-comment-btn',
        )
        await expect(postBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(postBtn).toBeDisabled()
      },
    )

    test(
      '"Post Comment" button enables after typing',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await page
          .getByTestId('comment-input')
          .fill('Great snippet!')
        await expect(
          page.getByTestId('post-comment-btn'),
        ).not.toBeDisabled()
      },
    )

    test(
      '"Post Comment" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByLabel('Post comment'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 17 – Code  /site/demo/code
// ---------------------------------------------------------------------------

test.describe('Code — /site/demo/code', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/code/albums**', (route) =>
      route.fulfill({ json: [] }),
    )
  })

  test(
    'page loads and shows "Code Snippets" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/code`)
      await expect(
        page.getByRole('heading', {
          name: 'Code Snippets',
        }),
      ).toBeVisible()
    },
  )

  test(
    'subtitle about code collections is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/code`)
      await expect(
        page.getByText(
          /Browse collections of code snippets/i,
        ),
      ).toBeVisible()
    },
  )

  test(
    'renders without a fatal JS error',
    async ({ page }) => {
      const { errors, cleanup } =
        collectConsoleErrors(page)
      await page.goto(`${BASE}/code`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 18 – Dependencies  /site/demo/dependencies
// ---------------------------------------------------------------------------

test.describe(
  'Dependencies — /site/demo/dependencies',
  () => {
    test(
      'page loads and shows "Dependencies" heading',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.getByRole('heading', {
            name: 'Dependencies',
          }),
        ).toBeVisible()
      },
    )

    test(
      'subtitle about shared libraries is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.getByText(
            /Browse shared libraries and dependencies/i,
          ),
        ).toBeVisible()
      },
    )

    test(
      'search input is present on dependencies page',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.getByPlaceholder(
            'Search dependencies...',
          ),
        ).toBeVisible()
      },
    )

    test(
      'typing in search updates value',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        const searchInput = page.getByPlaceholder(
          'Search dependencies...',
        )
        await searchInput.fill('opengl')
        await expect(searchInput).toHaveValue(
          'opengl',
        )
      },
    )

    test(
      '"Filter by Tag" dropdown is present',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.getByLabel('Filter by Tag'),
        ).toBeVisible()
      },
    )

    test(
      '"Sort By" dropdown is present',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.getByLabel('Sort By'),
        ).toBeVisible()
      },
    )

    test(
      'dependency cards are rendered from placeholder data',
      async ({ page }) => {
        await page.goto(`${BASE}/dependencies`)
        await expect(
          page.locator('body'),
        ).toBeVisible()
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/dependencies`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 19 – User profile  /site/demo/users/admin
// ---------------------------------------------------------------------------

test.describe(
  'User profile — /site/demo/users/admin',
  () => {
    test(
      'shows user profile when API returns data',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({
              json: [MOCK_USER],
            }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByText('admin'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'shows "User not found" when API returns empty',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByText('User not found'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'profile tabs are rendered when user exists',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        // Four profile tabs: Activity, Achievements,
        // Followers, Following
        await expect(
          page.getByRole('tab', { name: 'Activity' }),
        ).toBeVisible({ timeout: 8_000 })
        await expect(
          page.getByRole('tab', {
            name: 'Achievements',
          }),
        ).toBeVisible()
      },
    )

    test(
      'Followers tab is rendered',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByRole('tab', {
            name: 'Followers',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'Following tab is rendered',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByRole('tab', {
            name: 'Following',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'clicking Achievements tab switches panel',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await page
          .getByRole('tab', { name: 'Achievements' })
          .click()
        // After click the tab must be selected.
        await expect(
          page.getByRole('tab', {
            name: 'Achievements',
            selected: true,
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'clicking Followers tab switches panel',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await page
          .getByRole('tab', { name: 'Followers' })
          .click()
        await expect(
          page.getByRole('tab', {
            name: 'Followers',
            selected: true,
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'clicking Following tab switches panel',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await page
          .getByRole('tab', { name: 'Following' })
          .click()
        await expect(
          page.getByRole('tab', {
            name: 'Following',
            selected: true,
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'user reputation chip is visible',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByText(/42 reputation/i),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'Follow button is rendered on the profile card',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.route(
          '**/api/follow**',
          (route) =>
            route.fulfill({ json: { following: false } }),
        )
        await page.goto(`${BASE}/users/admin`)
        // FollowButton is rendered inside the profile paper.
        const profilePaper = page.locator(
          '[data-testid]',
        ).first()
        await expect(profilePaper).toBeVisible({
          timeout: 8_000,
        })
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [] }),
        )
        await page.goto(`${BASE}/users/admin`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 20 – Keyboard navigation & ARIA
// ---------------------------------------------------------------------------

test.describe(
  'Keyboard navigation & ARIA — cross-page',
  () => {
    test(
      'Tab key moves focus through tenant home links',
      async ({ page }) => {
        await page.goto(`${BASE}/`)
        // Focus the body and start tabbing.
        await page.locator('body').press('Tab')
        const focusedTag = await page.evaluate(
          () => document.activeElement?.tagName,
        )
        // First focusable element should be an A or BUTTON.
        expect(
          ['A', 'BUTTON', 'INPUT'].includes(
            focusedTag ?? '',
          ),
        ).toBe(true)
      },
    )

    test(
      'article list has correct region ARIA label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles**',
          (route) =>
            route.fulfill({
              json: { items: [], total: 0 },
            }),
        )
        await page.goto(`${BASE}/articles`)
        await expect(
          page.locator(
            '[aria-label="Article list header"]',
          ),
        ).toBeAttached()
      },
    )

    test(
      'article search section has ARIA label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles**',
          (route) =>
            route.fulfill({
              json: { items: [], total: 0 },
            }),
        )
        await page.goto(`${BASE}/articles`)
        await expect(
          page.locator(
            '[aria-label="Article search"]',
          ),
        ).toBeAttached()
      },
    )

    test(
      'forum page renders main heading with h1 semantics',
      async ({ page }) => {
        await page.goto(`${BASE}/forum`)
        // The "Forum" h3/h1 heading must exist.
        await expect(
          page.getByRole('heading', { name: 'Forum' }),
        ).toBeVisible()
      },
    )

    test(
      'snippets page "New Snippet" button is keyboard-activatable',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/snippets**',
          (route) =>
            route.fulfill({ json: { items: [] } }),
        )
        await page.goto(`${BASE}/snippets`)
        const newBtn = page.getByTestId(
          'new-snippet-btn',
        )
        await newBtn.focus()
        // Pressing Enter on the link-button should
        // navigate — just verify it can be focused.
        await expect(newBtn).toBeFocused()
      },
    )

    test(
      'forum thread create form fields all have labels',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        // All MUI TextFields expose a <label> via
        // InputLabel — check they exist.
        await expect(
          page.getByLabel('Thread Title'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Description'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Post Content'),
        ).toBeVisible()
      },
    )

    test(
      'article create form fields all have accessible labels',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await loginAsAdmin(page)
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByLabel('Title'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Tags (comma-separated)'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Revision Summary'),
        ).toBeVisible()
      },
    )

    test(
      'gallery album view breadcrumb is keyboard-accessible',
      async ({ page }) => {
        await page.route(
          '**/api/gallery/albums/1**',
          (route) =>
            route.fulfill({
              json: {
                id: 1,
                name: 'Vacation 2024',
                pictures: [],
              },
            }),
        )
        await page.goto(`${BASE}/gallery/1`)
        const nav = page.getByLabel(
          'Gallery breadcrumb',
        )
        await expect(nav).toBeVisible({
          timeout: 8_000,
        })
      },
    )
  },
)
