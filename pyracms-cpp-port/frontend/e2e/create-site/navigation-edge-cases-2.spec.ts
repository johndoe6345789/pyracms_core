import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Navigation edge cases', () => {
  test(
    'authenticated form heading reads '
    + '"Create Your Site"',
    async ({ page }) => {
      await loginAsAdmin(page)
      await expect(page).toHaveURL('/create-site')
      await expect(
        page.getByRole('heading', {
          name: 'Create Your Site',
        }),
      ).toBeVisible()
    },
  )
})
