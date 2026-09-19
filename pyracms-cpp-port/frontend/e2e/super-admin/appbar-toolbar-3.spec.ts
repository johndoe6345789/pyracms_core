import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  // UserBubble / avatar menu

  test(
    'UserBubble avatar button is visible when ' + 'authenticated',
    async ({ page }) => {
      await expect(page.getByTestId('user-bubble-btn')).toBeVisible()
    },
  )

  test('UserBubble avatar button has aria-label "User menu"', async ({
    page,
  }) => {
    await expect(page.getByTestId('user-bubble-btn')).toHaveAttribute(
      'aria-label',
      'User menu',
    )
  })

  test('clicking UserBubble opens the user menu', async ({ page }) => {
    await page.getByTestId('user-bubble-btn').click()
    // The menu contains the admin/settings/logout items
    await expect(page.getByTestId('logout-btn')).toBeVisible()
  })

  test('user menu contains Admin, Settings, Sign Out items', async ({
    page,
  }) => {
    await page.getByTestId('user-bubble-btn').click()
    await expect(page.getByTestId('admin-link')).toBeVisible()
    await expect(page.getByTestId('settings-link')).toBeVisible()
    await expect(page.getByTestId('logout-btn')).toBeVisible()
  })

  test('Escape closes the user menu', async ({ page }) => {
    await page.getByTestId('user-bubble-btn').click()
    await expect(page.getByTestId('logout-btn')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('logout-btn')).not.toBeVisible()
  })
})
