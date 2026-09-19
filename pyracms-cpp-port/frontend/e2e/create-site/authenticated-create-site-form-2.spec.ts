import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Authenticated create-site form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    // Guard: ensure we're on /create-site with the form
    await expect(page).toHaveURL('/create-site')
  })

  test('slug is auto-filled from site name', async ({ page }) => {
    const nameInput = page.getByTestId('site-name-input')
    const slugInput = page.getByTestId('site-slug-input')

    await nameInput.fill('My Test Blog')

    // Trigger change event so React state updates
    await nameInput.press('Tab')

    await expect(slugInput).toHaveValue('my-test-blog')
  })

  test(
    'slug auto-fill handles special characters ' + 'and spaces',
    async ({ page }) => {
      const nameInput = page.getByTestId('site-name-input')
      const slugInput = page.getByTestId('site-slug-input')

      await nameInput.fill('Hello  World! 123')
      await nameInput.press('Tab')

      // Expected: hello-world-123
      await expect(slugInput).toHaveValue('hello-world-123')
    },
  )

  test(
    'manually edited slug is not overwritten ' + 'when name changes',
    async ({ page }) => {
      const nameInput = page.getByTestId('site-name-input')
      const slugInput = page.getByTestId('site-slug-input')

      await nameInput.fill('First Name')
      await nameInput.press('Tab')

      // Manually override slug
      await slugInput.fill('custom-slug')
      await slugInput.press('Tab')

      // Change name — slug must stay as manually set
      await nameInput.fill('Second Name')
      await nameInput.press('Tab')

      await expect(slugInput).toHaveValue('custom-slug')
    },
  )
})
