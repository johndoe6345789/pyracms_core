import { test, expect } from '@playwright/test'
import { goToSuperAdmin } from '../support/super-admin-helpers-1'

test.describe('Access denied — unauthenticated', () => {
  test(
    'shows Access Denied without a login session',
    async ({ page }) => {
      await goToSuperAdmin(page)

      const denied = page.getByTestId('super-admin-denied')
      await expect(denied).toBeVisible()
      await expect(denied).toContainText('Access Denied')
    },
  )
})
