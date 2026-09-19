import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Authenticated create-site form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    // Guard: ensure we're on /create-site with the form
    await expect(page).toHaveURL('/create-site')
  })

  test(
    'site-description input has aria-label ' + '"Site description"',
    async ({ page }) => {
      await expect(page.getByTestId('site-description-input')).toHaveAttribute(
        'aria-label',
        'Site description',
      )
    },
  )
})
