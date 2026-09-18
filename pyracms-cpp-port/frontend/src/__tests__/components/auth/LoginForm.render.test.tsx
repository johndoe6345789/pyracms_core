import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as h from '../../helpers/loginForm'

jest.mock('next/navigation', () =>
  require('../../helpers/loginForm').navMock)
jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => require('../../helpers/loginForm').useLoginMock(),
}))

const { renderLoginForm } = h
beforeEach(() => h.resetState())

describe('LoginForm – structural rendering', () => {
  it('renders the username field', () => {
    renderLoginForm()
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  it('renders the password field', () => {
    renderLoginForm()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('renders the submit button with text "Sign In"', () => {
    renderLoginForm()
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument()
  })

  it('renders the register link', () => {
    renderLoginForm()
    const link = screen.getByTestId('register-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent(/sign up/i)
  })

  it('renders the "Forgot password?" link', () => {
    renderLoginForm()
    const link = screen.getByTestId('forgot-password-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent(/forgot password/i)
  })
})

describe('LoginForm – register link', () => {
  it('href points to /auth/register', () => {
    renderLoginForm()
    const link = screen.getByTestId('register-link')
    expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('has aria-label "Sign up for an account"', () => {
    renderLoginForm()
    const link = screen.getByTestId('register-link')
    expect(link).toHaveAttribute(
      'aria-label', 'Sign up for an account',
    )
  })
})
