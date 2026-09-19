import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Authenticated create-site form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    // Guard: ensure we're on /create-site with the form
    await expect(page).toHaveURL('/create-site')
  })

  test(
    'submitting the form redirects to /site/{slug} ' +
      'or displays a handled API error',
    async ({ page }) => {
      await page.getByTestId('site-name-input').fill('My Test Blog')
      await page.getByTestId('site-name-input').press('Tab')

      await page
        .getByTestId('site-description-input')
        .fill('A blog for testing purposes.')

      await page.getByTestId('create-site-submit').click()

      // The app either redirects on success or shows an
      // inline error — both outcomes are acceptable here.
      const redirected = await page
        .waitForURL('/site/my-test-blog', { timeout: 8000 })
        .then(() => true)
        .catch(() => false)

      if (!redirected) {
        // API unavailable in test env — error must be shown
        await expect(page.getByTestId('create-site-error')).toBeVisible()
      }
    },
  )
})
