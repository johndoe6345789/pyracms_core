/**
 * Tests for AuthPromptCard: ARIA semantics and data-testid.
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthPromptCard from '@/components/create-site/AuthPromptCard'

// next/link renders a plain <a> in the jest/jsdom environment.
jest.mock(
  'next/link',
  () => jest.requireActual('../../helpers/createSiteMockLink').MockLink,
)

describe('AuthPromptCard', () => {
  beforeEach(() => {
    render(<AuthPromptCard />)
  })

  // ── ARIA / accessibility ──────────────────────────────────

  it('has role="region" with aria-label "Authentication required"', () => {
    const region = screen.getByRole('region', {
      name: /authentication required/i,
    })
    expect(region).toBeInTheDocument()
  })

  it('Sign In button has descriptive aria-label', () => {
    const btn = screen.getByTestId('prompt-login-button')
    expect(btn).toHaveAttribute('aria-label', 'Sign in to your account')
  })

  it('Register button has descriptive aria-label', () => {
    const btn = screen.getByTestId('prompt-register-button')
    expect(btn).toHaveAttribute('aria-label', 'Create a new account')
  })

  // ── data-testid ───────────────────────────────────────────

  it('renders data-testid="auth-prompt-card"', () => {
    expect(screen.getByTestId('auth-prompt-card')).toBeInTheDocument()
  })

  it('renders data-testid="prompt-login-button"', () => {
    expect(screen.getByTestId('prompt-login-button')).toBeInTheDocument()
  })

  it('renders data-testid="prompt-register-button"', () => {
    expect(screen.getByTestId('prompt-register-button')).toBeInTheDocument()
  })
})
