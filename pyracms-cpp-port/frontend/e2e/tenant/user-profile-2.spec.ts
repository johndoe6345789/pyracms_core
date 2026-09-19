import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_USER } from '../support/tenant-data-3'

test.describe(
  'User profile — /site/demo/users/admin',
  () => {
    test(
      'Following tab is rendered',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByRole('tab', {
            name: 'Following',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'clicking Achievements tab switches panel',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await page
          .getByRole('tab', { name: 'Achievements' })
          .click()
        // After click the tab must be selected.
        await expect(
          page.getByRole('tab', {
            name: 'Achievements',
            selected: true,
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'clicking Followers tab switches panel',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await page
          .getByRole('tab', { name: 'Followers' })
          .click()
        await expect(
          page.getByRole('tab', {
            name: 'Followers',
            selected: true,
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)
