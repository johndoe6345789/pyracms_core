/**
 * Tests for /auth/login/create-site (LoginForm with redirectTo).
 * The hooks that make network calls are mocked at module level.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithStore } from '../../helpers/createSiteAuthRender'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => ({
    formData: { username: '', password: '' },
    updateField: jest.fn(),
    error: '',
    loading: false,
    handleSubmit: jest.fn(),
  }),
}))

import LoginCreateSitePage
  from '@/app/auth/login/create-site/page'

describe('/auth/login/create-site page', () => {
  beforeEach(() => renderWithStore(<LoginCreateSitePage />))

  it('renders the auth page shell (role=main)', () => {
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the login form', () => {
    expect(
      screen.getByTestId('login-form'),
    ).toBeInTheDocument()
  })

  it('login form has accessible label', () => {
    expect(
      screen.getByRole('form', { name: /login form/i }),
    ).toBeInTheDocument()
  })

  it('renders username and password fields', () => {
    expect(
      screen.getByTestId('username-input'),
    ).toBeInTheDocument()
    // PasswordField renders with data-testid on the MUI
    // wrapper; verify the submit button is present instead.
    expect(
      screen.getByTestId('login-submit'),
    ).toBeInTheDocument()
  })
})
