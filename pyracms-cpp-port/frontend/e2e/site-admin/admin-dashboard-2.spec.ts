import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  // Quick-link cards — every label in the QUICK_LINKS array
  const QUICK_LINK_IDS = [
    'quick-link-users',
    'quick-link-settings',
    'quick-link-feature-toggles',
    'quick-link-menus',
    'quick-link-acl',
    'quick-link-files',
    'quick-link-backup',
  ]

  for (const testId of QUICK_LINK_IDS) {
    test(
      `quick-link card "${testId}" is present`,
      async ({ page }) => {
        await expect(
          page.getByTestId(testId),
        ).toBeVisible()
      },
    )
  }

  test(
    'clicking the Users quick-link navigates to /users',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-users')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
    },
  )

  test(
    'clicking the Settings quick-link navigates to /settings',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-settings')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/settings`,
        ),
      )
    },
  )

  test(
    'clicking the Feature Toggles quick-link navigates',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-feature-toggles')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/features`,
        ),
      )
    },
  )
})
