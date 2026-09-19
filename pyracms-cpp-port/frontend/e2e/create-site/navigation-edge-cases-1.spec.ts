import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Navigation edge cases', () => {
  test(
    'authenticated user visiting /create-site sees '
    + 'the form, not the AuthPromptCard',
    async ({ page }) => {
      await loginAsAdmin(page)
      await expect(page).toHaveURL('/create-site')

      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
      await expect(
        page.getByTestId('auth-prompt-card'),
      ).not.toBeVisible()
    },
  )

  test(
    'authenticated user clicking Create New Site '
    + 'on portal goes directly to /create-site',
    async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/')

      await page
        .getByTestId('create-site-button')
        .click()

      await expect(page).toHaveURL('/create-site')
      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
    },
  )

  test(
    'create-site page has correct heading',
    async ({ page }) => {
      await page.goto('/create-site')
      // The page-level heading "New Site" is always visible
      // regardless of auth state.
      await expect(
        page.getByRole('heading', { name: 'New Site' }),
      ).toBeVisible()
    },
  )

  test(
    'create-site page main region has accessible label',
    async ({ page }) => {
      await page.goto('/create-site')
      await expect(
        page.getByRole('main', {
          name: 'Create new site',
        }),
      ).toBeVisible()
    },
  )

  test(
    'auth-prompt region has accessible label',
    async ({ page }) => {
      await page.goto('/create-site')
      await expect(
        page.getByRole('region', {
          name: 'Authentication required',
        }),
      ).toBeVisible()
    },
  )
})
