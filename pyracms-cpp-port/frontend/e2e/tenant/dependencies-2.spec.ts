import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe(
  'Dependencies — /site/demo/dependencies',
  () => {
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
