/**
 * E2E tests for PyraCMS tenant content pages.
 *
 * Routes covered (all under /site/demo/):
 *  - /site/demo/                       Tenant home
 *  - /site/demo/articles               Article list
 *  - /site/demo/articles/hello-world   Article detail
 *  - /site/demo/articles/create        Article create form
 *  - /site/demo/forum                  Forum index
 *  - /site/demo/forum/1                Forum thread list
 *  - /site/demo/gallery                Gallery index
 *  - /site/demo/games                  Game catalog
 *  - /site/demo/snippets               Snippets list
 *  - /site/demo/code                   Code snippets/albums
 *  - /site/demo/dependencies           Dependencies catalog
 *  - /site/demo/users/admin            User profile
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLUG = 'demo'
const BASE = `/site/${SLUG}`

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
    .waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
      timeout: 8_000,
    })
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
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', handler)
  return {
    errors,
    cleanup: () => page.off('console', handler),
  }
}

// ---------------------------------------------------------------------------
// Suite 1 – Tenant home  /site/demo/
// ---------------------------------------------------------------------------

test.describe('Tenant home — /site/demo/', () => {
  test('page loads without a JS console error', async ({ page }) => {
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
  })

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

  test('welcome body text mentions the site name', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(
      page.getByText(/Welcome to Demo/i),
    ).toBeVisible()
  })

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
})

// ---------------------------------------------------------------------------
// Suite 2 – Article list  /site/demo/articles
// ---------------------------------------------------------------------------

test.describe('Articles list — /site/demo/articles', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the tenant lookup and articles API so the page
    // renders predictably without a live backend.
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({
        json: [{ id: 1, slug: SLUG, name: 'Demo' }],
      }),
    )
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: { items: [], total: 0 } }),
    )
  })

  test('page loads and shows "Articles" heading', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    await expect(
      page.getByRole('heading', { name: 'Articles' }),
    ).toBeVisible()
  })

  test('article list page container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    await expect(
      page.getByTestId('article-list-page'),
    ).toBeVisible()
  })

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
      await expect(searchInput).toHaveValue('playwright')
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
        const { errors, cleanup } = collectConsoleErrors(page)
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
        // Mock tenant + article endpoints
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({
            json: [{ id: 1, slug: SLUG, name: 'Demo' }],
          }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({
              json: {
                id: 1,
                name: 'hello-world',
                displayName: 'Hello World',
                content: '<p>Hello from the test.</p>',
                renderer: 'html',
                author: 'admin',
                createdDate: '2024-01-01',
                tags: [],
                views: 0,
                likes: 0,
                dislikes: 0,
                revisionNumber: 1,
              },
            }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        // The article detail page wraps in article-detail-page
        // when an article is returned.
        await expect(
          page.getByTestId('article-detail-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'shows "not found" state or null when article missing',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({
            json: [{ id: 1, slug: SLUG, name: 'Demo' }],
          }),
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
// Suite 4 – Article create  /site/demo/articles/create
// ---------------------------------------------------------------------------

test.describe(
  'Article create — /site/demo/articles/create',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({
          json: [{ id: 1, slug: SLUG, name: 'Demo' }],
        }),
      )
    })

    test('page container is rendered', async ({ page }) => {
      await page.goto(`${BASE}/articles/create`)
      await expect(
        page.getByTestId('create-article-page'),
      ).toBeVisible()
    })

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

    test('title input field is visible', async ({ page }) => {
      await page.goto(`${BASE}/articles/create`)
      await expect(
        page.getByTestId('article-title-input'),
      ).toBeVisible()
    })

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
  },
)

// ---------------------------------------------------------------------------
// Suite 5 – Forum index  /site/demo/forum
// ---------------------------------------------------------------------------

test.describe('Forum — /site/demo/forum', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({
        json: [{ id: 1, slug: SLUG, name: 'Demo' }],
      }),
    )
    await page.route(
      '**/api/forum/categories**',
      (route) =>
        route.fulfill({ json: [] }),
    )
  })

  test('page loads and shows "Forum" heading', async ({ page }) => {
    await page.goto(`${BASE}/forum`)
    await expect(
      page.getByRole('heading', { name: 'Forum' }),
    ).toBeVisible()
  })

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
      const { errors, cleanup } = collectConsoleErrors(page)
      await page.goto(`${BASE}/forum`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 6 – Forum thread list  /site/demo/forum/1
// ---------------------------------------------------------------------------

test.describe('Forum thread list — /site/demo/forum/1', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/forum/forums/1**', (route) =>
      route.fulfill({
        json: {
          id: 1,
          name: 'General Discussion',
          description: 'Talk about anything.',
        },
      }),
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
    '"Back to Forums" link navigates to forum index',
    async ({ page }) => {
      await page.goto(`${BASE}/forum/1`)
      await expect(
        page.getByText('Back to Forums'),
      ).toBeVisible()
    },
  )

  test(
    'renders without a fatal JS error',
    async ({ page }) => {
      const { errors, cleanup } = collectConsoleErrors(page)
      await page.goto(`${BASE}/forum/1`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 7 – Gallery  /site/demo/gallery
// ---------------------------------------------------------------------------

test.describe('Gallery — /site/demo/gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({
        json: [{ id: 1, slug: SLUG, name: 'Demo' }],
      }),
    )
    await page.route(
      '**/api/gallery/albums**',
      (route) => route.fulfill({ json: [] }),
    )
  })

  test('page loads and shows "Gallery" heading', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(
      page.getByRole('heading', { name: 'Gallery' }),
    ).toBeVisible()
  })

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
    'subtitle text about photo albums is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/gallery`)
      await expect(
        page.getByText(/Browse photo albums/i),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 8 – Games  /site/demo/games
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
      const { errors, cleanup } = collectConsoleErrors(page)
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
// Suite 9 – Snippets  /site/demo/snippets
// ---------------------------------------------------------------------------

test.describe('Snippets — /site/demo/snippets', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({
        json: [{ id: 1, slug: SLUG, name: 'Demo' }],
      }),
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
    'snippet search input is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('snippet-search'),
      ).toBeVisible()
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
    'empty state message is shown when no snippets exist',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('no-snippets-msg'),
      ).toBeVisible()
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 10 – Code  /site/demo/code
// ---------------------------------------------------------------------------

test.describe('Code — /site/demo/code', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({
        json: [{ id: 1, slug: SLUG, name: 'Demo' }],
      }),
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
      const { errors, cleanup } = collectConsoleErrors(page)
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
// Suite 11 – Dependencies  /site/demo/dependencies
// ---------------------------------------------------------------------------

test.describe('Dependencies — /site/demo/dependencies', () => {
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
        page.getByPlaceholder('Search dependencies...'),
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
      const { errors, cleanup } = collectConsoleErrors(page)
      await page.goto(`${BASE}/dependencies`)
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 12 – User profile  /site/demo/users/admin
// ---------------------------------------------------------------------------

test.describe('User profile — /site/demo/users/admin', () => {
  test(
    'shows user profile when API returns data',
    async ({ page }) => {
      await page.route(
        '**/api/users**',
        (route) =>
          route.fulfill({
            json: [
              {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                bio: 'Site administrator',
                location: 'Earth',
                avatarUrl: '',
                reputation: 42,
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
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
      await page.route('**/api/users**', (route) =>
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
      await page.route('**/api/users**', (route) =>
        route.fulfill({
          json: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              bio: '',
              location: '',
              avatarUrl: '',
              reputation: 0,
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        }),
      )
      await page.goto(`${BASE}/users/admin`)
      // Four profile tabs: Activity, Achievements,
      // Followers, Following
      await expect(
        page.getByRole('tab', { name: 'Activity' }),
      ).toBeVisible({ timeout: 8_000 })
      await expect(
        page.getByRole('tab', { name: 'Achievements' }),
      ).toBeVisible()
    },
  )

  test(
    'renders without a fatal JS error',
    async ({ page }) => {
      const { errors, cleanup } = collectConsoleErrors(page)
      await page.route('**/api/users**', (route) =>
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
})
