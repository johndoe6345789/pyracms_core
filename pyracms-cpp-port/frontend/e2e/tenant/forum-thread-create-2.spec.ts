import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Forum thread create — /site/demo/forum/thread/create', () => {
  test('thread title input is present', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByTestId('thread-title-input')).toBeVisible()
  })

  test('thread description input is present', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByTestId('thread-description-input')).toBeVisible()
  })

  test('thread content textarea is present', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    await expect(page.getByTestId('thread-content-input')).toBeVisible()
  })

  test('title input accepts text', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    const titleInput = page.getByTestId('thread-title-input')
    await titleInput.fill('My New Thread')
    await expect(titleInput).toHaveValue('My New Thread')
  })

  test('description input accepts text', async ({ page }) => {
    await page.goto(`${BASE}/forum/thread/create`)
    const descInput = page.getByTestId('thread-description-input')
    await descInput.fill('Brief description')
    await expect(descInput).toHaveValue('Brief description')
  })
})
