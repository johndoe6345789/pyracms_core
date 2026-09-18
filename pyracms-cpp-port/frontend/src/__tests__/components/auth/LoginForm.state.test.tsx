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

describe('LoginForm – forgot-password link', () => {
  it('href points to /auth/forgot-password', () => {
    renderLoginForm()
    const link = screen.getByTestId('forgot-password-link')
    expect(link).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('has aria-label "Forgot your password?"', () => {
    renderLoginForm()
    const link = screen.getByTestId('forgot-password-link')
    expect(link).toHaveAttribute(
      'aria-label', 'Forgot your password?',
    )
  })
})

describe('LoginForm – loading state', () => {
  it('disables the submit button while loading', () => {
    h.setMockState({ loading: true })
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).toBeDisabled()
  })

  it('shows "Signing in..." text while loading', () => {
    h.setMockState({ loading: true })
    renderLoginForm()
    expect(
      screen.getByTestId('login-submit'),
    ).toHaveTextContent(/signing in/i)
  })

  it('enables the submit button when not loading', () => {
    h.setMockState({ loading: false })
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).not.toBeDisabled()
  })
})

describe('LoginForm – error display', () => {
  it('shows error message via LoginHeader when error '
    + 'is returned from the hook', () => {
    h.setMockState({ error: 'Invalid credentials' })
    renderLoginForm()
    expect(
      screen.getByTestId('login-error'),
    ).toHaveTextContent('Invalid credentials')
  })

  it('does not show error alert when error is empty', () => {
    h.setMockState({ error: '' })
    renderLoginForm()
    expect(
      screen.queryByTestId('login-error'),
    ).not.toBeInTheDocument()
  })
})
