import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs, waitForTenantsLoaded } from '../support/super-admin-helpers-1'

test.describe('Tenant management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'shows "Tenants" heading and "New Site" button',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Tenants' }),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toBeVisible()
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toContainText('New Site')
    },
  )

  test(
    '"New Site" button links to /create-site',
    async ({ page }) => {
      const btn = page.getByTestId('new-tenant-button')
      await expect(btn).toHaveAttribute(
        'href',
        '/create-site',
      )
    },
  )

  test(
    '"New Site" button has accessible aria-label',
    async ({ page }) => {
      await expect(
        page.getByTestId('new-tenant-button'),
      ).toHaveAttribute('aria-label', 'Create new site')
    },
  )

  test(
    '"New Site" button is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('new-tenant-button')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL('/create-site')
    },
  )

  test(
    'tenant management table is rendered',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      await expect(
        page.getByTestId('tenant-management-table'),
      ).toBeVisible()
    },
  )
})
