import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'selecting "Light" from theme menu closes the menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await page.getByTestId('theme-light').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )

  test(
    'Escape closes the theme menu',
    async ({ page }) => {
      await page.getByTestId('theme-toggle').click()
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(
        page.getByTestId('theme-menu'),
      ).not.toBeVisible()
    },
  )

  test(
    'ThemeToggle has aria-haspopup="true"',
    async ({ page }) => {
      await expect(
        page.getByTestId('theme-toggle'),
      ).toHaveAttribute('aria-haspopup', 'true')
    },
  )

  test(
    'ThemeToggle aria-expanded changes when open',
    async ({ page }) => {
      const btn = page.getByTestId('theme-toggle')
      await expect(btn).toHaveAttribute(
        'aria-expanded',
        'false',
      )
      await btn.click()
      await expect(btn).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    },
  )

  test(
    'ThemeToggle is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('theme-toggle')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByTestId('theme-menu'),
      ).toBeVisible()
    },
  )
})
