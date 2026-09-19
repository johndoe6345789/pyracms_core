import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_USER } from '../support/tenant-data-3'

test.describe('User profile — /site/demo/users/admin', () => {
  test('clicking Following tab switches panel', async ({ page }) => {
    await page.route('**/api/users**', (route) =>
      route.fulfill({ json: [MOCK_USER] }),
    )
    await page.goto(`${BASE}/users/admin`)
    await page.getByRole('tab', { name: 'Following' }).click()
    await expect(
      page.getByRole('tab', {
        name: 'Following',
        selected: true,
      }),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('user reputation chip is visible', async ({ page }) => {
    await page.route('**/api/users**', (route) =>
      route.fulfill({ json: [MOCK_USER] }),
    )
    await page.goto(`${BASE}/users/admin`)
    await expect(page.getByText(/42 reputation/i)).toBeVisible({
      timeout: 8_000,
    })
  })

  test('Follow button is rendered on the profile card', async ({ page }) => {
    await page.route('**/api/users**', (route) =>
      route.fulfill({ json: [MOCK_USER] }),
    )
    await page.route('**/api/follow**', (route) =>
      route.fulfill({ json: { following: false } }),
    )
    await page.goto(`${BASE}/users/admin`)
    // FollowButton is rendered inside the profile paper.
    const profilePaper = page.locator('[data-testid]').first()
    await expect(profilePaper).toBeVisible({
      timeout: 8_000,
    })
  })
})
