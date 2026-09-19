import { type Page } from '@playwright/test'

export function userFor(slug: string) {
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

export async function mockApi(page: Page, loginBodies: unknown[]) {
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

export async function signIn(page: Page, slug: string) {
  await page.goto(`/auth/login?tenant=${slug}`)
  await page.getByTestId('username-input').fill('richard')
  await page.getByTestId('password-input').fill('secret-password')
  await page.getByTestId('login-submit').click()
  await page.waitForURL(`**/site/${slug}**`)
}

export const token = (page: Page, slug: string) =>
  page.evaluate((k) => localStorage.getItem(k), `token:${slug}`)
