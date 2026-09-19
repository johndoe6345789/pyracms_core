import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/features')
    await page
      .getByTestId('admin-features-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-features-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-features-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Feature Toggles" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /feature toggles/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Save Changes" button is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('save-features-btn'),
      ).toBeVisible()
    },
  )

  test(
    'feature card for "articles" is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('feature-card-articles'),
      ).toBeVisible()
    },
  )

  test(
    'feature card for "forum" is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('feature-card-forum'),
      ).toBeVisible()
    },
  )

  test(
    'feature toggle for "articles" is checked (enabled=true)',
    async ({ page }) => {
      const toggle = page.getByTestId(
        'feature-toggle-articles',
      )
      await expect(toggle).toBeVisible()
      await expect(toggle).toBeChecked()
    },
  )
})
