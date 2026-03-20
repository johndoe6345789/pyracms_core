/**
 * Tests for AuthPromptCard component.
 *
 * Verifies lock icon, heading, description, button hrefs,
 * ARIA region semantics, and data-testid attributes.
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthPromptCard
  from '@/components/create-site/AuthPromptCard'

// next/link renders a plain <a> in the jest/jsdom environment.
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('AuthPromptCard', () => {
  beforeEach(() => {
    render(<AuthPromptCard />)
  })

  // ── Structure & copy ──────────────────────────────────────

  it('renders the heading "Sign in to Create a Site"', () => {
    expect(
      screen.getByRole('heading', {
        name: /sign in to create a site/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the description text', () => {
    expect(
      screen.getByText(
        /you need an account to create and manage/i,
      ),
    ).toBeInTheDocument()
  })

  it('renders the lock icon with aria-hidden', () => {
    // MUI SvgIcon renders an <svg>; aria-hidden is set on it.
    const icons = document.querySelectorAll(
      '[aria-hidden="true"]',
    )
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  // ── Buttons / links ───────────────────────────────────────

  it('Sign In button links to /auth/login/create-site', () => {
    const btn = screen.getByTestId('prompt-login-button')
    expect(btn).toHaveAttribute(
      'href',
      '/auth/login/create-site',
    )
    expect(btn).toHaveTextContent(/sign in/i)
  })

  it('Register button links to /auth/register/create-site', () => {
    const btn = screen.getByTestId('prompt-register-button')
    expect(btn).toHaveAttribute(
      'href',
      '/auth/register/create-site',
    )
    expect(btn).toHaveTextContent(/register/i)
  })

  // ── ARIA / accessibility ──────────────────────────────────

  it('has role="region" with aria-label "Authentication required"',
    () => {
      const region = screen.getByRole('region', {
        name: /authentication required/i,
      })
      expect(region).toBeInTheDocument()
    },
  )

  it('Sign In button has descriptive aria-label', () => {
    const btn = screen.getByTestId('prompt-login-button')
    expect(btn).toHaveAttribute(
      'aria-label',
      'Sign in to your account',
    )
  })

  it('Register button has descriptive aria-label', () => {
    const btn = screen.getByTestId('prompt-register-button')
    expect(btn).toHaveAttribute(
      'aria-label',
      'Create a new account',
    )
  })

  // ── data-testid ───────────────────────────────────────────

  it('renders data-testid="auth-prompt-card"', () => {
    expect(
      screen.getByTestId('auth-prompt-card'),
    ).toBeInTheDocument()
  })

  it('renders data-testid="prompt-login-button"', () => {
    expect(
      screen.getByTestId('prompt-login-button'),
    ).toBeInTheDocument()
  })

  it('renders data-testid="prompt-register-button"', () => {
    expect(
      screen.getByTestId('prompt-register-button'),
    ).toBeInTheDocument()
  })
})
