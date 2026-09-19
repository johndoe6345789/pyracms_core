import { type Page } from '@playwright/test'

// Helpers

/**
 * Log in as the seeded admin account via /auth/login and
 * wait for the browser to navigate away from the login page.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login')
  await page.getByTestId('username-input').fill('admin')
  await page.getByTestId('password-input').fill('password123')
  await page.getByTestId('login-submit').click()
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 10_000,
  })
}

/**
 * Produces a unique username/email/password triple so that
 * parallel runs or re-runs do not collide on registration.
 */
export function uniqueUser() {
  const ts = Date.now()
  return {
    username: `e2euser_${ts}`,
    email: `e2euser_${ts}@example.com`,
    password: 'Str0ng!Pass',
    firstName: 'E2E',
    lastName: 'User',
  }
}

/**
 * Fill all 6 register fields with provided values.
 */
export async function fillRegisterForm(
  page: Page,
  opts: {
    username: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
  },
) {
  await page.getByTestId('register-username-input').fill(opts.username)
  await page.getByTestId('register-email-input').fill(opts.email)
  await page.getByTestId('register-password-input').fill(opts.password)
  await page
    .getByTestId('register-confirm-password-input')
    .fill(opts.confirmPassword)
  await page.getByTestId('register-firstname-input').fill(opts.firstName)
  await page.getByTestId('register-lastname-input').fill(opts.lastName)
}
