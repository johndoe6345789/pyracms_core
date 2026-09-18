/**
 * Accounts are per site: signing out of one site must leave the session
 * on another site untouched. The API is mocked; sessions live in
 * localStorage as `token:<slug>`.
 */
import { test, expect, type Page } from '@playwright/test'

const SITES = ['demo', 'acme'] as const

function userFor(slug: string) {
  return {
    id: slug === 'demo' ? 3 : 4,
    username: 'richard',
    email: `richard@${slug}.test`,
    fullName: `Richard (${slug})`,
    role: 3,
    tenantId: slug === 'demo' ? 1 : 2,
    tenantSlug: slug,
  }
}

async function mockApi(page: Page, loginBodies: unknown[]) {
  await page.route('**/api/**', (route) => {
    const req = route.request()
    const path = new URL(req.url()).pathname
    if (path === '/api/auth/login') {
      const body = req.postDataJSON() as { tenant: string }
      loginBodies.push(body)
      return route.fulfill({
        json: { token: `jwt-${body.tenant}`, user: userFor(body.tenant) },
      })
    }
    if (path === '/api/auth/me') {
      const auth = req.headers()['authorization'] ?? ''
      const slug = auth.replace('Bearer jwt-', '')
      return route.fulfill({ json: userFor(slug) })
    }
    const site = path.match(/^\/api\/tenants\/([^/]+)$/)
    if (site) {
      return route.fulfill({
        json: { id: 1, slug: site[1], displayName: site[1] },
      })
    }
    return route.fulfill({ json: [] })
  })
}

async function signIn(page: Page, slug: string) {
  await page.goto(`/auth/login?tenant=${slug}`)
  await page.getByTestId('username-input').fill('richard')
  await page.getByTestId('password-input').fill('secret-password')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(`**/site/${slug}**`)
}

const token = (page: Page, slug: string) =>
  page.evaluate((k) => localStorage.getItem(k), `token:${slug}`)

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
