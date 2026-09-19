import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { renderLoginForm, resetMockState } from '../../helpers/loginFormMock'

jest.mock('next/navigation', () =>
  require('../../helpers/loginFormMock').navigationModule(),
)
jest.mock('@/hooks/useLogin', () =>
  require('../../helpers/loginFormMock').loginHookModule(),
)

beforeEach(() => {
  resetMockState()
})

describe('LoginForm – data-testid attributes', () => {
  it('has data-testid="login-form" on the <form>', () => {
    renderLoginForm()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('has data-testid="username-input"', () => {
    renderLoginForm()
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  it('has data-testid="password-input"', () => {
    renderLoginForm()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('has data-testid="login-submit"', () => {
    renderLoginForm()
    expect(screen.getByTestId('login-submit')).toBeInTheDocument()
  })

  it('has data-testid="register-link"', () => {
    renderLoginForm()
    expect(screen.getByTestId('register-link')).toBeInTheDocument()
  })

  it('has data-testid="forgot-password-link"', () => {
    renderLoginForm()
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument()
  })
})
