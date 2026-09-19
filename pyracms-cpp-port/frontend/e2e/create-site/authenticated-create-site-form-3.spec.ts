import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe(
  'Authenticated create-site form',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      // Guard: ensure we're on /create-site with the form
      await expect(page).toHaveURL('/create-site')
    })

    test(
      'invalid slug pattern shows an error',
      async ({ page }) => {
        const slugInput =
          page.getByTestId('site-slug-input')

        // Clear auto-filled slug first
        await page
          .getByTestId('site-name-input')
          .fill('Test')
        await slugInput.press('Tab')

        // Enter an invalid slug (leading hyphen)
        await slugInput.fill('-invalid')
        await slugInput.press('Tab')

        await expect(
          page.getByTestId('create-site-error'),
        ).toBeVisible()
      },
    )

    test(
      'slug with uppercase characters is blocked or '
      + 'normalised',
      async ({ page }) => {
        const slugInput =
          page.getByTestId('site-slug-input')

        await page
          .getByTestId('site-name-input')
          .fill('Test')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        await slugInput.fill('UPPERCASE')
        await slugInput.press('Tab')

        // Either the error fires, or the value was
        // normalised to lowercase — either is acceptable.
        const errorVisible = await page
          .getByTestId('create-site-error')
          .isVisible()
          .catch(() => false)
        const val = await slugInput.inputValue()
        const isLower = val === val.toLowerCase()
        expect(errorVisible || isLower).toBe(true)
      },
    )
  },
)
