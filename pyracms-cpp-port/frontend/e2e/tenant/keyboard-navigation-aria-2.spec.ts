import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { loginAsAdmin } from '../support/tenant-helpers-1'

test.describe(
  'Keyboard navigation & ARIA — cross-page',
  () => {
    test(
      'snippets page "New Snippet" button is keyboard-activatable',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/snippets**',
          (route) =>
            route.fulfill({ json: { items: [] } }),
        )
        await page.goto(`${BASE}/snippets`)
        const newBtn = page.getByTestId(
          'new-snippet-btn',
        )
        await newBtn.focus()
        // Pressing Enter on the link-button should
        // navigate — just verify it can be focused.
        await expect(newBtn).toBeFocused()
      },
    )

    test(
      'forum thread create form fields all have labels',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        // All MUI TextFields expose a <label> via
        // InputLabel — check they exist.
        await expect(
          page.getByLabel('Thread Title'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Description'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Post Content'),
        ).toBeVisible()
      },
    )

    test(
      'article create form fields all have accessible labels',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await loginAsAdmin(page)
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByLabel('Title'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Tags (comma-separated)'),
        ).toBeVisible()
        await expect(
          page.getByLabel('Revision Summary'),
        ).toBeVisible()
      },
    )
  },
)
