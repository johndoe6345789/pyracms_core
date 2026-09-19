import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe('Gallery album view — /site/demo/gallery/1', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/gallery/albums/1**', (route) =>
      route.fulfill({
        json: {
          id: 1,
          name: 'Vacation 2024',
          pictures: [],
        },
      }),
    )
  })

  test('"Upload" button has accessible aria-label', async ({ page }) => {
    await page.goto(`${BASE}/gallery/1`)
    await expect(page.getByLabel('Upload pictures')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('hidden file input is present inside Upload button', async ({
    page,
  }) => {
    await page.goto(`${BASE}/gallery/1`)
    await expect(page.getByTestId('upload-file-input')).toBeAttached()
  })

  test('renders without a fatal JS error', async ({ page }) => {
    const { errors, cleanup } = collectConsoleErrors(page)
    await page.goto(`${BASE}/gallery/1`)
    cleanup()
    const fatal = errors.filter((e) => e.includes('Uncaught'))
    expect(fatal).toHaveLength(0)
  })
})
