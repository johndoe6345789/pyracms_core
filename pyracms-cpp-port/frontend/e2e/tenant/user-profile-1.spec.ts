import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_USER } from '../support/tenant-data-3'

test.describe(
  'User profile — /site/demo/users/admin',
  () => {
    test(
      'shows user profile when API returns data',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({
              json: [MOCK_USER],
            }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByText('admin'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'shows "User not found" when API returns empty',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByText('User not found'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'profile tabs are rendered when user exists',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        // Four profile tabs: Activity, Achievements,
        // Followers, Following
        await expect(
          page.getByRole('tab', { name: 'Activity' }),
        ).toBeVisible({ timeout: 8_000 })
        await expect(
          page.getByRole('tab', {
            name: 'Achievements',
          }),
        ).toBeVisible()
      },
    )

    test(
      'Followers tab is rendered',
      async ({ page }) => {
        await page.route(
          '**/api/users**',
          (route) =>
            route.fulfill({ json: [MOCK_USER] }),
        )
        await page.goto(`${BASE}/users/admin`)
        await expect(
          page.getByRole('tab', {
            name: 'Followers',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)
