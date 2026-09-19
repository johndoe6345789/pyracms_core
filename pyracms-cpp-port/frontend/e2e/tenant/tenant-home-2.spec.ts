import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Tenant home — /site/demo/', () => {
  test(
    'module card for Gallery is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Gallery/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/gallery`,
      )
    },
  )

  test(
    'module card for Games is visible and links correctly',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      const card = page.getByRole('link', {
        name: /Games/i,
      })
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute(
        'href',
        `${BASE}/games`,
      )
    },
  )

  test(
    'all four module cards are rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      // TenantModuleCards renders exactly four cards
      const cards = page.getByRole('link', {
        name: /Articles|Forum|Gallery|Games/i,
      })
      await expect(cards).toHaveCount(4)
    },
  )

  test(
    'clicking the Articles card navigates to articles list',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Articles/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/articles`),
      )
    },
  )

  test(
    'clicking the Forum card navigates to forum',
    async ({ page }) => {
      await page.goto(`${BASE}/`)
      await page
        .getByRole('link', { name: /Forum/i })
        .click()
      await expect(page).toHaveURL(
        new RegExp(`${BASE}/forum`),
      )
    },
  )
})
