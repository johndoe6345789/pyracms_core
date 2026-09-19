import { test, expect } from '@playwright/test'
import { SITES } from '../support/two-sites-logout-data-1'
import { mockApi, signIn, token } from '../support/two-sites-logout-helpers-1'

test.describe('two sites keep independent sessions', () => {
  test('signing out of demo keeps acme signed in', async ({ page }) => {
    const loginBodies: unknown[] = []
    await mockApi(page, loginBodies)

    for (const slug of SITES) await signIn(page, slug)
    expect(loginBodies).toEqual([
      expect.objectContaining({ tenant: 'demo', username: 'richard' }),
      expect.objectContaining({ tenant: 'acme', username: 'richard' }),
    ])
    expect(await token(page, 'demo')).toBe('jwt-demo')
    expect(await token(page, 'acme')).toBe('jwt-acme')

    await page.goto('/site/demo')
    await page.getByTestId('user-bubble-btn').click()
    await page.getByTestId('logout-btn').click()

    await expect.poll(() => token(page, 'demo')).toBeNull()
    expect(await token(page, 'acme')).toBe('jwt-acme')

    await page.goto('/site/acme')
    await expect(page.getByTestId('user-bubble-btn')).toBeVisible()
  })

  test('the same username is a guest on the other site', async ({ page }) => {
    await mockApi(page, [])
    await signIn(page, 'demo')
    await page.goto('/site/acme')
    await expect(page.getByTestId('user-bubble-btn')).toHaveCount(0)
    expect(await token(page, 'acme')).toBeNull()
  })
})
