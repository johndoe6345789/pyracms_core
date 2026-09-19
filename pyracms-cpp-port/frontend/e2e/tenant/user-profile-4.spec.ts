import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe(
  'User profile — /site/demo/users/admin',
  () => {
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
