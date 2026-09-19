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

describe('LoginForm – structural rendering', () => {
  it('renders the username field', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('username-input'),
    ).toBeInTheDocument()
  })

  it('renders the password field', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('password-input'),
    ).toBeInTheDocument()
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
