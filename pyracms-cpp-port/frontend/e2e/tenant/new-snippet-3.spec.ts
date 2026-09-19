import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe('New Snippet — /site/demo/snippets/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
  })

  test('renders without a fatal JS error', async ({ page }) => {
    const { errors, cleanup } = collectConsoleErrors(page)
    await page.goto(`${BASE}/snippets/new`)
    cleanup()
    const fatal = errors.filter((e) => e.includes('Uncaught'))
    expect(fatal).toHaveLength(0)
  })
})
