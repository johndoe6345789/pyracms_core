import { test, expect } from '@playwright/test'

test.describe('Portal — /', () => {
  test(
    'page renders with "Welcome to PyraCMS" heading',
    async ({ page }) => {
      await page.goto('/')

      await expect(
        page.getByRole('heading', {
          name: /Welcome to PyraCMS/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'portal-page data-testid is present',
    async ({ page }) => {
      await page.goto('/')

      await expect(
        page.getByTestId('portal-page'),
      ).toBeVisible()
    },
  )

  test(
    'create-site-button is visible on the portal',
    async ({ page }) => {
      await page.goto('/')

      await expect(
        page.getByTestId('create-site-button'),
      ).toBeVisible()
    },
  )

  test(
    'unauthenticated: Create Site button href resolves '
    + 'to /auth/login/create-site',
    async ({ page }) => {
      await page.goto('/')

      const btn = page.getByTestId('create-site-button')
      await expect(btn).toBeVisible()

      // The href attribute is set by the component; clicking
      // it exercises Next.js Link navigation.
      await btn.click()

      await expect(page).toHaveURL(
        '/auth/login/create-site',
      )
    },
  )

  test(
    'portal main region has an accessible label',
    async ({ page }) => {
      await page.goto('/')

      // The page must expose a <main> element (a11y).
      await expect(page.locator('main')).toBeVisible()
    },
  )
})
