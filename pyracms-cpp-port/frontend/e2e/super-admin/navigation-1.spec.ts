import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test('Tenants nav item navigates to /super-admin/tenants', async ({
    page,
  }) => {
    await page.getByTestId('super-admin-nav-tenants').click()
    await expect(page).toHaveURL(/\/super-admin\/tenants/)
    await expect(page.getByTestId('super-admin-tenants-page')).toBeVisible()
  })

  test('Users nav item navigates to /super-admin/users', async ({ page }) => {
    await page.getByTestId('super-admin-nav-users').click()
    await expect(page).toHaveURL(/\/super-admin\/users/)
    await expect(page.getByTestId('super-admin-users-page')).toBeVisible()
  })

  test(
    'Settings nav item navigates to ' + '/super-admin/settings',
    async ({ page }) => {
      await page.getByTestId('super-admin-nav-settings').click()
      await expect(page).toHaveURL(/\/super-admin\/settings/)
      await expect(page.getByTestId('super-admin-settings-page')).toBeVisible()
    },
  )

  test('Dashboard nav item navigates back to /super-admin', async ({
    page,
  }) => {
    // Go somewhere else first
    await page.goto('/super-admin/users')
    await page.getByTestId('super-admin-nav-dashboard').click()
    await expect(page).toHaveURL(/\/super-admin$/)
    await expect(page.getByTestId('super-admin-dashboard-title')).toBeVisible()
  })

  test('"Back to Portal" link navigates to /', async ({ page }) => {
    await page.getByTestId('super-admin-back-portal').click()
    await expect(page).toHaveURL('/')
  })
})
