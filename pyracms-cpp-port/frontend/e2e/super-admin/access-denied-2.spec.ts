import { test, expect } from '@playwright/test'
import { REGULAR_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Access denied — regular user', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, REGULAR_USER)
  })

  test(
    'regular user (role < SuperAdmin) is blocked from '
    + '/super-admin',
    async ({ page }) => {
      await goToSuperAdmin(page)

      const denied = page.getByTestId('super-admin-denied')
      await expect(denied).toBeVisible()
      await expect(denied).toContainText('Access Denied')
    },
  )
})
