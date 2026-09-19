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
      'submit button aria-label changes to '
      + '"Creating site" while loading',
      async ({ page }) => {
        await page
          .getByTestId('site-name-input')
          .fill('Aria Label Test')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        const submitBtn = page.getByTestId(
          'create-site-submit',
        )

        // Verify default label
        await expect(submitBtn).toHaveAttribute(
          'aria-label',
          'Create site',
        )

        // Hang the API so loading state persists
        await page.route('**/api/tenants', (route) =>
          new Promise(() => { void route }),
        )

        await submitBtn.click()

        await expect(submitBtn).toHaveAttribute(
          'aria-label',
          'Creating site',
        )
      },
    )

    test(
      'keyboard navigation: Tab moves through '
      + 'fields in correct order',
      async ({ page }) => {
        // Start focus on site-name
        const nameInput =
          page.getByTestId('site-name-input')
        await nameInput.focus()
        await expect(nameInput).toBeFocused()

        // Tab → slug
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('site-slug-input'),
        ).toBeFocused()

        // Tab → description
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('site-description-input'),
        ).toBeFocused()

        // Tab → submit
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('create-site-submit'),
        ).toBeFocused()
      },
    )
  },
)
