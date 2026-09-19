import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'Enter key on Dashboard nav navigates to ' + '/super-admin',
    async ({ page }) => {
      await page.goto('/super-admin/users')
      const dashNav = page.getByTestId('super-admin-nav-dashboard')
      await dashNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )

  test('Tab order: Dashboard → Tenants → Users → Settings', async ({
    page,
  }) => {
    const dashboard = page.getByTestId('super-admin-nav-dashboard')
    await dashboard.focus()
    await expect(dashboard).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('super-admin-nav-tenants')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('super-admin-nav-users')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('super-admin-nav-settings')).toBeFocused()
  })

  test('Space key on Dashboard nav item activates it', async ({ page }) => {
    await page.goto('/super-admin/tenants')
    const dashNav = page.getByTestId('super-admin-nav-dashboard')
    await dashNav.focus()
    await page.keyboard.press('Space')
    await expect(page).toHaveURL(/\/super-admin$/)
  })
})
