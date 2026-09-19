import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Super admin — authenticated access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  test(
    'shows Platform Overview dashboard',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('super-admin-dashboard-title'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-dashboard-title'),
      ).toHaveText('Platform Overview')
    },
  )

  test(
    'sidebar contains all primary nav links',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('super-admin-nav-dashboard'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-tenants'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-users'),
      ).toBeVisible()
      await expect(
        page.getByTestId('super-admin-nav-settings'),
      ).toBeVisible()
    },
  )

  test(
    'quick-action cards are rendered',
    async ({ page }) => {
      await goToSuperAdmin(page)

      await expect(
        page.getByTestId('quick-tenants'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-users'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-settings'),
      ).toBeVisible()
      await expect(
        page.getByTestId('quick-create-site'),
      ).toBeVisible()
    },
  )
})
