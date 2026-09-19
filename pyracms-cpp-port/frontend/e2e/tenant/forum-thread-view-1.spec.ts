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

  test('thread view page container is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(page.getByTestId('view-thread-page')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Back to Forum" button is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(page.getByText('Back to Forum')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('posts list container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(page.getByTestId('posts-list')).toBeVisible({ timeout: 8_000 })
  })

  test('posts list has correct ARIA role and label', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/1`)
    await expect(
      page.getByRole('list', {
        name: 'Thread posts',
      }),
    ).toBeVisible({ timeout: 8_000 })
  })
})
