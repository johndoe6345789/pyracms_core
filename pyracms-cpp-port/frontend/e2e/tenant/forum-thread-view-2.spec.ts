import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_POSTS, MOCK_THREAD } from '../support/tenant-data-2'

test.describe('Forum thread view — /site/demo/forum/thread/1', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/forum/threads/1**', (route) =>
      route.fulfill({ json: MOCK_THREAD }),
    )
    await page.route('**/api/forum/posts**', (route) =>
      route.fulfill({ json: MOCK_POSTS }),
    )
  })

  test('quick reply form is rendered', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(page.getByTestId('quick-reply-form')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('quick reply textarea is present', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(page.getByTestId('quick-reply-input')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('quick reply submit button is present and initially disabled', async ({
    page,
  }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    const submitBtn = page.getByTestId('quick-reply-submit')
    await expect(submitBtn).toBeVisible({
      timeout: 8_000,
    })
    await expect(submitBtn).toBeDisabled()
  })

  test('typing in quick reply enables the submit button', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await page.getByTestId('quick-reply-input').fill('This is my reply.')
    await expect(page.getByTestId('quick-reply-submit')).not.toBeDisabled()
  })
})
