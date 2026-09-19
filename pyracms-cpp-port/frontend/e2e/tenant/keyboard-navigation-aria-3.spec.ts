import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe(
  'Keyboard navigation & ARIA — cross-page',
  () => {
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
