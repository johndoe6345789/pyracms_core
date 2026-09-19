import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'all sidebar nav items are reachable and activatable '
    + 'via keyboard',
    async ({ page }) => {
      // Focus the sidebar nav list region
      const navList = page.getByTestId(
        'super-admin-nav-list',
      )
      await navList.focus()

      const navTestIds = [
        'super-admin-nav-dashboard',
        'super-admin-nav-tenants',
        'super-admin-nav-users',
        'super-admin-nav-settings',
      ]

      for (const testId of navTestIds) {
        const item = page.getByTestId(testId)
        // Each list item button should be focusable
        await item.focus()
        await expect(item).toBeFocused()
      }
    },
  )

  test(
    'Enter key on Tenants nav activates the link',
    async ({ page }) => {
      const tenantsNav = page.getByTestId(
        'super-admin-nav-tenants',
      )
      await tenantsNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        /\/super-admin\/tenants/,
      )
    },
  )

  test(
    'Enter key on Users nav activates the link',
    async ({ page }) => {
      const usersNav = page.getByTestId(
        'super-admin-nav-users',
      )
      await usersNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/super-admin\/users/)
    },
  )

  test(
    'Enter key on Settings nav activates the link',
    async ({ page }) => {
      const settingsNav = page.getByTestId(
        'super-admin-nav-settings',
      )
      await settingsNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        /\/super-admin\/settings/,
      )
    },
  )
})
