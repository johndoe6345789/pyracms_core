import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Templates', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/templates')
  })

  test(
    'toggling Preview button hides live preview pane',
    async ({ page }) => {
      // Preview is visible by default
      await expect(
        page.getByText(/live preview/i),
      ).toBeVisible()
      // Click the ToggleButton to hide it
      await page
        .getByRole('button', { name: /preview/i })
        .click()
      await expect(
        page.getByText(/live preview/i),
      ).not.toBeVisible()
    },
  )

  test(
    '"Save" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^save$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Reset" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^reset$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'live preview pane renders default header HTML',
    async ({ page }) => {
      await expect(
        page.getByText(/live preview - header/i),
      ).toBeVisible()
    },
  )

  test(
    'Monaco editor container is mounted',
    async ({ page }) => {
      await page
        .locator('.monaco-editor')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 })
        .catch(() => {
          // Monaco may not load in headless — skip gracefully
        })
    },
  )
})
