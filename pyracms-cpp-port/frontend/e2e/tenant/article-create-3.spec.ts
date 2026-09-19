import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors, loginAsAdmin } from '../support/tenant-helpers-1'

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
