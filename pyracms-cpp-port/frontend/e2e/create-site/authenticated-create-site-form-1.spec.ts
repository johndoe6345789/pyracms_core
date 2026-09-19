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
      'create-site form fields are all visible',
      async ({ page }) => {
        await expect(
          page.getByTestId('create-site-form'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-name-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-slug-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-description-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('create-site-submit'),
        ).toBeVisible()
      },
    )

    test(
      'site-name input accepts typed text',
      async ({ page }) => {
        const input = page.getByTestId('site-name-input')
        await input.fill('My Awesome Site')
        await expect(input).toHaveValue('My Awesome Site')
      },
    )

    test(
      'site-slug input accepts typed text',
      async ({ page }) => {
        const input = page.getByTestId('site-slug-input')
        await input.fill('my-awesome-site')
        await expect(input).toHaveValue('my-awesome-site')
      },
    )

    test(
      'site-description input accepts multi-line text',
      async ({ page }) => {
        const input = page.getByTestId(
          'site-description-input',
        )
        await input.fill('Line one\nLine two')
        await expect(input).toHaveValue('Line one\nLine two')
      },
    )

    test(
      'slug helper text shows "/site/<slug>" preview '
      + 'when slug has a value',
      async ({ page }) => {
        const nameInput =
          page.getByTestId('site-name-input')
        await nameInput.fill('Preview Test')
        await nameInput.press('Tab')
        // Helper text should contain /site/ prefix
        await expect(page.getByText(/\/site\//)).toBeVisible()
      },
    )
  },
)
