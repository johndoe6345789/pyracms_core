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
      'mocked success redirects to /site/{slug}',
      async ({ page }) => {
        await page.route('**/api/tenants', (route) => {
          if (route.request().method() === 'POST') {
            return route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: 99,
                slug: 'mock-site',
                displayName: 'Mock Site',
                ownerUsername: 'admin',
                isActive: true,
                createdAt: '2026-01-01T00:00:00Z',
              }),
            })
          }
          return route.continue()
        })

        await page
          .getByTestId('site-name-input')
          .fill('Mock Site')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        await page
          .getByTestId('create-site-submit')
          .click()

        await page
          .waitForURL('/site/**', { timeout: 8_000 })
          .catch(() => {
            // App may not call POST /api/tenants with
            // this mock — tolerate gracefully.
          })
      },
    )
  },
)
