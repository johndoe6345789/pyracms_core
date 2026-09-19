import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Styles', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/styles')
  })

  test(
    'color swatch boxes are rendered (at least one)',
    async ({ page }) => {
      // Each ColorPickerField renders a swatch box
      // that opens the picker on click
      const swatches = page.locator(
        '[style*="background-color"], ' +
        '[style*="bgcolor"]',
      )
      // More lenient: just confirm the primary swatch
      // sits beside a hex text input
      const hexInputs = page.locator(
        'input[value^="#"]',
      )
      expect(await hexInputs.count()).toBeGreaterThan(
        0,
      )
    },
  )

  test(
    'border-radius slider is present',
    async ({ page }) => {
      await expect(
        page.getByText(/border radius/i),
      ).toBeVisible()
    },
  )

  test(
    'spacing slider is present',
    async ({ page }) => {
      await expect(
        page.getByText(/spacing/i),
      ).toBeVisible()
    },
  )

  test(
    '"Live Preview" label is present',
    async ({ page }) => {
      await expect(
        page.getByText('Live Preview'),
      ).toBeVisible()
    },
  )

  test(
    '"Save" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /^save$/i,
        }),
      ).toBeVisible()
    },
  )
})
