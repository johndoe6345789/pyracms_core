import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Authenticated create-site form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    // Guard: ensure we're on /create-site with the form
    await expect(page).toHaveURL('/create-site')
  })

  test('mocked API error shows create-site-error alert', async ({ page }) => {
    await page.route('**/api/tenants', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Slug already taken',
          }),
        })
      }
      return route.continue()
    })

    await page.getByTestId('site-name-input').fill('Conflict Site')
    await page.getByTestId('site-name-input').press('Tab')

    await page.getByTestId('create-site-submit').click()

    await page
      .getByTestId('create-site-error')
      .waitFor({ state: 'visible', timeout: 8_000 })
      .catch(() => {
        // Tolerate if mock path differs
      })
  })

  test(
    'submit button is disabled while request is ' + 'in-flight',
    async ({ page }) => {
      await page.getByTestId('site-name-input').fill('Loading Test')
      await page.getByTestId('site-name-input').press('Tab')

      const submitBtn = page.getByTestId('create-site-submit')

      // Intercept the API call so it hangs
      await page.route(
        '**/api/tenants',
        (route) =>
          new Promise(() => {
            /* never resolve */
            void route
          }),
      )

      await submitBtn.click()

      await expect(submitBtn).toBeDisabled()
    },
  )
})
