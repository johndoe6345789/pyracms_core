import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Forum thread create — /site/demo/forum/thread/create', () => {
  test('thread create page container is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByTestId('create-thread-page')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Create New Thread" heading is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(
      page.getByRole('heading', {
        name: 'Create New Thread',
      }),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('"Back to Forum" link is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByText('Back to Forum')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('create thread form is rendered', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByTestId('create-thread-form')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('form has accessible role and aria-label', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(
      page.getByRole('form', {
        name: 'Create thread form',
      }),
    ).toBeVisible({ timeout: 8_000 })
  })
})
