import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

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
