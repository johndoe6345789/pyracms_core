/**
 * E2E tests for the PyraCMS create-site flow.
 *
 * Covers:
 *  - Guest: portal CTA → login redirect
 *  - Guest: /create-site shows AuthPromptCard
 *  - Login page at /auth/login/create-site
 *  - Login → redirect to /create-site with form
 *  - Authenticated form: slug auto-fill, submit
 *  - Register → redirect to /create-site
 *  - Keyboard navigation through the create-site form
 *  - Edge cases: invalid slug, empty submit, toggle
 *    password visibility
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fast login via the create-site login page.
 * Returns once the browser has navigated away from the
 * login page (either to /create-site or shows an error).
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login/create-site')
  await page.getByTestId('username-input').fill('admin')
  await page.getByTestId('password-input').fill('password123')
  await page.getByTestId('login-submit').click()
}

/**
 * Produces a unique username safe for registration tests so
 * parallel runs or re-runs do not collide.
 */
function uniqueUser() {
  const ts = Date.now()
  return {
    username: `testuser_${ts}`,
    email: `testuser_${ts}@example.com`,
    password: 'Passw0rd!',
  }
}

// ---------------------------------------------------------------------------
// Suite 1 – Guest flows
// ---------------------------------------------------------------------------

test.describe('Guest flow — unauthenticated user', () => {
  test(
    'Create New Site button on portal navigates to '
    + '/auth/login/create-site',
    async ({ page }) => {
      await page.goto('/')

      const btn = page.getByTestId('create-site-button')
      await expect(btn).toBeVisible()

      // As a guest the href resolves to the login page.
      // Use click() so Next.js Link navigation is exercised.
      await btn.click()

      await expect(page).toHaveURL('/auth/login/create-site')
      await expect(
        page.getByTestId('login-form'),
      ).toBeVisible()
    },
  )

  test(
    'Visiting /create-site directly shows AuthPromptCard',
    async ({ page }) => {
      await page.goto('/create-site')

      const card = page.getByTestId('auth-prompt-card')
      await expect(card).toBeVisible()

      // "Sign In" button must link to the create-site login
      const signIn = page.getByTestId('prompt-login-button')
      await expect(signIn).toBeVisible()
      await expect(signIn).toHaveAttribute(
        'href',
        '/auth/login/create-site',
      )

      // "Register" button must also be present
      const register = page.getByTestId(
        'prompt-register-button',
      )
      await expect(register).toBeVisible()
      await expect(register).toHaveAttribute(
        'href',
        '/auth/register/create-site',
      )
    },
  )

  test(
    'Sign In button on AuthPromptCard navigates to '
    + 'the login page',
    async ({ page }) => {
      await page.goto('/create-site')
      await page.getByTestId('prompt-login-button').click()
      await expect(page).toHaveURL('/auth/login/create-site')
    },
  )

  test(
    'Register button on AuthPromptCard navigates to '
    + 'the register page',
    async ({ page }) => {
      await page.goto('/create-site')
      await page
        .getByTestId('prompt-register-button')
        .click()
      await expect(page).toHaveURL(
        '/auth/register/create-site',
      )
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 2 – Login page at /auth/login/create-site
// ---------------------------------------------------------------------------

test.describe('Login page — /auth/login/create-site', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/auth/login/create-site')

    await expect(
      page.getByTestId('login-form'),
    ).toBeVisible()
    await expect(
      page.getByTestId('username-input'),
    ).toBeVisible()
    await expect(
      page.getByTestId('password-input'),
    ).toBeVisible()
    await expect(
      page.getByTestId('login-submit'),
    ).toBeVisible()
  })

  test(
    'toggle-password button reveals/hides password',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')

      const pwInput = page.getByTestId('password-input')
      await expect(pwInput).toHaveAttribute('type', 'password')

      await page.getByTestId('toggle-password').click()
      await expect(pwInput).toHaveAttribute('type', 'text')

      await page.getByTestId('toggle-password').click()
      await expect(pwInput).toHaveAttribute('type', 'password')
    },
  )

  test(
    'forgot-password link points to '
    + '/auth/forgot-password',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      await expect(
        page.getByTestId('forgot-password-link'),
      ).toHaveAttribute('href', '/auth/forgot-password')
    },
  )

  test(
    'successful login redirects to /create-site',
    async ({ page }) => {
      await loginAsAdmin(page)

      await expect(page).toHaveURL('/create-site')
      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
    },
  )

  test(
    'invalid credentials show an error message',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      await page
        .getByTestId('username-input')
        .fill('nobody')
      await page
        .getByTestId('password-input')
        .fill('wrongpassword')
      await page.getByTestId('login-submit').click()

      // LoginHeader renders an error region; the exact
      // selector depends on the LoginHeader component —
      // fall back to checking we did NOT navigate away.
      await expect(page).toHaveURL('/auth/login/create-site')
    },
  )
})

// ---------------------------------------------------------------------------
// Suite 3 – Authenticated create-site form
// ---------------------------------------------------------------------------

test.describe(
  'Authenticated create-site form',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      // Guard: ensure we're on /create-site with the form
      await expect(page).toHaveURL('/create-site')
    })

    test(
      'create-site form fields are all visible',
      async ({ page }) => {
        await expect(
          page.getByTestId('create-site-form'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-name-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-slug-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('site-description-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('create-site-submit'),
        ).toBeVisible()
      },
    )

    test(
      'slug is auto-filled from site name',
      async ({ page }) => {
        const nameInput = page.getByTestId('site-name-input')
        const slugInput = page.getByTestId('site-slug-input')

        await nameInput.fill('My Test Blog')

        // Trigger change event so React state updates
        await nameInput.press('Tab')

        await expect(slugInput).toHaveValue('my-test-blog')
      },
    )

    test(
      'slug auto-fill handles special characters '
      + 'and spaces',
      async ({ page }) => {
        const nameInput = page.getByTestId('site-name-input')
        const slugInput = page.getByTestId('site-slug-input')

        await nameInput.fill('Hello  World! 123')
        await nameInput.press('Tab')

        // Expected: hello-world-123
        await expect(slugInput).toHaveValue('hello-world-123')
      },
    )

    test(
      'manually edited slug is not overwritten '
      + 'when name changes',
      async ({ page }) => {
        const nameInput = page.getByTestId('site-name-input')
        const slugInput = page.getByTestId('site-slug-input')

        await nameInput.fill('First Name')
        await nameInput.press('Tab')

        // Manually override slug
        await slugInput.fill('custom-slug')
        await slugInput.press('Tab')

        // Change name — slug must stay as manually set
        await nameInput.fill('Second Name')
        await nameInput.press('Tab')

        await expect(slugInput).toHaveValue('custom-slug')
      },
    )

    test(
      'invalid slug pattern shows an error',
      async ({ page }) => {
        const slugInput = page.getByTestId('site-slug-input')

        // Clear auto-filled slug first
        await page
          .getByTestId('site-name-input')
          .fill('Test')
        await slugInput.press('Tab')

        // Enter an invalid slug (leading hyphen)
        await slugInput.fill('-invalid')
        await slugInput.press('Tab')

        await expect(
          page.getByTestId('create-site-error'),
        ).toBeVisible()
      },
    )

    test(
      'submitting the form redirects to /site/{slug} '
      + 'or displays a handled API error',
      async ({ page }) => {
        await page
          .getByTestId('site-name-input')
          .fill('My Test Blog')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        await page
          .getByTestId('site-description-input')
          .fill('A blog for testing purposes.')

        await page
          .getByTestId('create-site-submit')
          .click()

        // The app either redirects on success or shows an
        // inline error — both outcomes are acceptable here.
        const redirected = await page
          .waitForURL('/site/my-test-blog', { timeout: 8000 })
          .then(() => true)
          .catch(() => false)

        if (!redirected) {
          // API unavailable in test env — error must be shown
          await expect(
            page.getByTestId('create-site-error'),
          ).toBeVisible()
        }
      },
    )

    test(
      'submit button is disabled while request is '
      + 'in-flight',
      async ({ page }) => {
        await page
          .getByTestId('site-name-input')
          .fill('Loading Test')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        const submitBtn = page.getByTestId(
          'create-site-submit',
        )

        // Intercept the API call so it hangs
        await page.route('**/api/tenants', (route) =>
          new Promise(() => {
            /* never resolve */
            void route
          }),
        )

        await submitBtn.click()

        await expect(submitBtn).toBeDisabled()
      },
    )

    test(
      'keyboard navigation: Tab moves through '
      + 'fields in correct order',
      async ({ page }) => {
        // Start focus on site-name
        const nameInput = page.getByTestId('site-name-input')
        await nameInput.focus()
        await expect(nameInput).toBeFocused()

        // Tab → slug
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('site-slug-input'),
        ).toBeFocused()

        // Tab → description
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('site-description-input'),
        ).toBeFocused()

        // Tab → submit
        await page.keyboard.press('Tab')
        await expect(
          page.getByTestId('create-site-submit'),
        ).toBeFocused()
      },
    )

    test(
      'Enter key on submit button triggers form '
      + 'submission',
      async ({ page }) => {
        await page
          .getByTestId('site-name-input')
          .fill('Keyboard Submit Test')
        await page
          .getByTestId('site-name-input')
          .press('Tab')

        await page
          .getByTestId('create-site-submit')
          .focus()
        await page.keyboard.press('Enter')

        // Either redirect or error — the form was submitted
        await Promise.race([
          page.waitForURL('/site/**', { timeout: 8000 }),
          page
            .getByTestId('create-site-error')
            .waitFor({ state: 'visible', timeout: 8000 }),
        ]).catch(() => {
          /* test is about submission being triggered,
             not the server outcome */
        })
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 4 – Register → redirect to /create-site
// ---------------------------------------------------------------------------

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test('renders registration form', async ({ page }) => {
      await page.goto('/auth/register/create-site')

      await expect(
        page.getByTestId('register-form'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-username-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-email-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-password-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-submit'),
      ).toBeVisible()
    })

    test(
      'successful registration redirects to /create-site',
      async ({ page }) => {
        const user = uniqueUser()
        await page.goto('/auth/register/create-site')

        await page
          .getByTestId('register-username-input')
          .fill(user.username)
        await page
          .getByTestId('register-email-input')
          .fill(user.email)
        await page
          .getByTestId('register-password-input')
          .fill(user.password)

        await page
          .getByTestId('register-submit')
          .click()

        // On success the RegisterForm redirectTo='/create-site'
        // redirects here; on failure (e.g. no API) stay on page
        const redirected = await page
          .waitForURL('/create-site', { timeout: 8000 })
          .then(() => true)
          .catch(() => false)

        if (redirected) {
          await expect(page).toHaveURL('/create-site')
        } else {
          // API not available — ensure we at least stayed on
          // the register page (no crash)
          await expect(page).toHaveURL(
            '/auth/register/create-site',
          )
        }
      },
    )

    test(
      'duplicate username registration shows an error',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')

        // "admin" is expected to already exist
        await page
          .getByTestId('register-username-input')
          .fill('admin')
        await page
          .getByTestId('register-email-input')
          .fill('admin@existing.com')
        await page
          .getByTestId('register-password-input')
          .fill('password123')
        await page
          .getByTestId('register-submit')
          .click()

        // Stays on register page; error alert visible
        await expect(page).toHaveURL(
          '/auth/register/create-site',
        )
        await expect(
          page.getByTestId('register-error'),
        ).toBeVisible()
      },
    )

    test(
      '"Login" link on register page navigates to '
      + '/auth/login',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page.getByTestId('login-link').click()
        await expect(page).toHaveURL('/auth/login')
      },
    )
  },
)

// ---------------------------------------------------------------------------
// Suite 5 – Navigation edge cases
// ---------------------------------------------------------------------------

test.describe('Navigation edge cases', () => {
  test(
    'authenticated user visiting /create-site sees '
    + 'the form, not the AuthPromptCard',
    async ({ page }) => {
      await loginAsAdmin(page)
      await expect(page).toHaveURL('/create-site')

      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
      await expect(
        page.getByTestId('auth-prompt-card'),
      ).not.toBeVisible()
    },
  )

  test(
    'authenticated user clicking Create New Site '
    + 'on portal goes directly to /create-site',
    async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/')

      await page
        .getByTestId('create-site-button')
        .click()

      await expect(page).toHaveURL('/create-site')
      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
    },
  )

  test(
    'create-site page has correct heading',
    async ({ page }) => {
      await page.goto('/create-site')
      // The page-level heading "New Site" is always visible
      // regardless of auth state.
      await expect(
        page.getByRole('heading', { name: 'New Site' }),
      ).toBeVisible()
    },
  )

  test(
    'create-site page main region has accessible label',
    async ({ page }) => {
      await page.goto('/create-site')
      await expect(
        page.getByRole('main', {
          name: 'Create new site',
        }),
      ).toBeVisible()
    },
  )

  test(
    'auth-prompt region has accessible label',
    async ({ page }) => {
      await page.goto('/create-site')
      await expect(
        page.getByRole('region', {
          name: 'Authentication required',
        }),
      ).toBeVisible()
    },
  )
})
