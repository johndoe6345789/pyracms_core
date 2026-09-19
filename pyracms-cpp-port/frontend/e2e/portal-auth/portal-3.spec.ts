import { test, expect } from '@playwright/test'

test.describe('Portal — /', () => {
  test('site cards are rendered when API returns tenants', async ({ page }) => {
    // Mock /api/tenants to return one site so the
    // TenantGrid always has cards to render.
    await page.route('**/api/tenants*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            slug: 'demo',
            name: 'Demo Site',
            description: 'A demo site',
            owner: 'admin',
          },
        ]),
      }),
    )

    await page.goto('/')

    // At least one CardActionArea link should appear.
    const card = page.getByRole('link').filter({ hasText: /Demo Site/i })
    await expect(card.first()).toBeVisible({
      timeout: 8_000,
    })
  })

  test('site card links navigate to /site/<slug>', async ({ page }) => {
    await page.route('**/api/tenants*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            slug: 'demo',
            name: 'Demo Site',
            description: 'A demo site',
            owner: 'admin',
          },
        ]),
      }),
    )

    await page.goto('/')

    const card = page.getByRole('link').filter({ hasText: /Demo Site/i })
    await expect(card.first()).toHaveAttribute('href', '/site/demo')
  })

  test('hero subtitle text is visible', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/Choose a site to explore/i)).toBeVisible()
  })
})
