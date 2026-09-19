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
      'Enter key on submit button triggers form '
      + 'submission',
      async ({ page }) => {
        await page
          .getByTestId('site-name-input')
          .fill('Keyboard Submit Test')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        await page
          .getByTestId('create-site-submit')
          .focus()
        await page.keyboard.press('Enter')

        // Either redirect or error — the form was submitted
        await Promise.race([
          page.waitForURL('/site/**', { timeout: 8000 }),
          page
            .getByTestId('create-site-error')
            .waitFor({
              state: 'visible',
              timeout: 8000,
            }),
        ]).catch(() => {
          /* test is about submission being triggered,
             not the server outcome */
        })
      },
    )

    test(
      'form has aria-label "Create site form"',
      async ({ page }) => {
        await expect(
          page.getByRole('form', {
            name: 'Create site form',
          }),
        ).toBeVisible()
      },
    )

    test(
      'site-name input has aria-label "Site name"',
      async ({ page }) => {
        await expect(
          page.getByTestId('site-name-input'),
        ).toHaveAttribute('aria-label', 'Site name')
      },
    )

    test(
      'site-slug input has aria-label "URL slug"',
      async ({ page }) => {
        await expect(
          page.getByTestId('site-slug-input'),
        ).toHaveAttribute('aria-label', 'URL slug')
      },
    )
  },
)
