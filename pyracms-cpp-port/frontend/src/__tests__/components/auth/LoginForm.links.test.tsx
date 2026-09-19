import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  renderLoginForm,
  resetMockState,
} from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  require('../../helpers/loginFormMock').navigationModule())
jest.mock('@/hooks/useLogin', () =>
  require('../../helpers/loginFormMock').loginHookModule())

beforeEach(() => {
  resetMockState()
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
      'aria-label',
      'Sign up for an account',
    )
  })
})

describe('LoginForm – forgot-password link', () => {
  it('href points to /auth/forgot-password', () => {
    renderLoginForm()
    const link = screen.getByTestId('forgot-password-link')
    expect(link).toHaveAttribute(
      'href',
      '/auth/forgot-password',
    )
  })

  it('has aria-label "Forgot your password?"', () => {
    renderLoginForm()
    const link = screen.getByTestId('forgot-password-link')
    expect(link).toHaveAttribute(
      'aria-label',
      'Forgot your password?',
    )
  })
})
