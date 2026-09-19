/**
 * Tests for AuthPromptCard: copy, links and test ids.
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
      screen.getByText(/you need an account to create and manage/i),
    ).toBeInTheDocument()
  })

  it('renders the lock icon with aria-hidden', () => {
    // MUI SvgIcon renders an <svg>; aria-hidden is set on it.
    const icons = document.querySelectorAll('[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  // ── Buttons / links ───────────────────────────────────────

  it('Sign In button links to /auth/login/create-site', () => {
    const btn = screen.getByTestId('prompt-login-button')
    expect(btn).toHaveAttribute('href', '/auth/login/create-site')
    expect(btn).toHaveTextContent(/sign in/i)
  })

  it('Register button links to /auth/register/create-site', () => {
    const btn = screen.getByTestId('prompt-register-button')
    expect(btn).toHaveAttribute('href', '/auth/register/create-site')
    expect(btn).toHaveTextContent(/register/i)
  })
})
