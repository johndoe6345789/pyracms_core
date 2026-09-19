import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'super admin toolbar is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'toolbar displays "PyraCMS Super Admin" title',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-toolbar'),
      ).toContainText('PyraCMS Super Admin')
    },
  )

  // ThemeToggle

  test(
    'ThemeToggle button is visible in the AppBar',
    async ({ page }) => {
      await expect(
        page.getByTestId('theme-toggle'),
      ).toBeVisible()
    },
  )

  test(
    'ThemeToggle button opens the theme menu on click',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
    },
  )

  test(
    'theme menu contains Light, Dark, System options',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-light'),
      ).toBeVisible()
      await expect(
        page.getByTestId('theme-dark'),
      ).toBeVisible()
      await expect(
        page.getByTestId('theme-system'),
      ).toBeVisible()
    },
  )

  test(
    'selecting "Dark" from theme menu closes the menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await page.getByTestId('theme-dark').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )
})
