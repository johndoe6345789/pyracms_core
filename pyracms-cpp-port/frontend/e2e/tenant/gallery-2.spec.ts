import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { MOCK_ALBUMS } from '../support/tenant-data-2'

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
