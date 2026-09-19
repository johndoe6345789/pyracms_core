import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

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
  },
)
