import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe(
  'Forum thread create — /site/demo/forum/thread/create',
  () => {
    test(
      'content textarea accepts text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        const contentInput = page.getByTestId(
          'thread-content-input',
        )
        await contentInput.fill(
          'The body of the first post.',
        )
        await expect(contentInput).toHaveValue(
          'The body of the first post.',
        )
      },
    )

    test(
      '"Create Thread" submit button is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-submit'),
        ).toBeVisible()
      },
    )

    test(
      '"Create Thread" submit has aria-label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByLabel('Create thread'),
        ).toBeVisible()
      },
    )

    test(
      '"Cancel" button links back to forum',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/create`,
        )
        await expect(
          page.getByTestId('create-thread-cancel'),
        ).toHaveAttribute('href', `${BASE}/forum`)
      },
    )
  },
)
