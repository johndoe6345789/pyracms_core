import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test('settings page shows Platform Settings heading', async ({ page }) => {
    await page.goto('/super-admin/settings')
    await expect(
      page.getByRole('heading', {
        name: 'Platform Settings',
      }),
    ).toBeVisible()
  })
})
