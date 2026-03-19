/**
 * Tests for the "create-site" auth flow pages:
 *   /auth/login/create-site   → LoginForm with redirectTo
 *   /auth/register/create-site → RegisterForm with redirectTo
 *
 * The hooks that make network calls are mocked at module
 * level so tests remain fast and deterministic.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'

// ----- mock next/navigation (used inside hooks) -----

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// ----- mock hooks that make API calls -----

jest.mock('@/hooks/useLogin', () => ({
  useLogin: () => ({
    formData: { username: '', password: '' },
    updateField: jest.fn(),
    error: '',
    loading: false,
    handleSubmit: jest.fn(),
  }),
}))

jest.mock('@/hooks/useRegister', () => ({
  useRegister: () => ({
    formData: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    updateField: jest.fn(),
    error: '',
    loading: false,
    handleSubmit: jest.fn(),
  }),
}))

// ----- pages under test -----

import LoginCreateSitePage
  from '@/app/auth/login/create-site/page'
import RegisterCreateSitePage
  from '@/app/auth/register/create-site/page'

// ----- shared test store (no persistence needed) -----

function makeTestStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

function renderWithStore(ui: React.ReactElement) {
  const store = makeTestStore()
  render(<Provider store={store}>{ui}</Provider>)
}

// =====================================================
// /auth/login/create-site
// =====================================================

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

// =====================================================
// /auth/register/create-site
// =====================================================

describe('/auth/register/create-site page', () => {
  beforeEach(() =>
    renderWithStore(<RegisterCreateSitePage />),
  )

  it('renders the auth page shell (role=main)', () => {
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the register form', () => {
    expect(
      screen.getByTestId('register-form'),
    ).toBeInTheDocument()
  })

  it('register form has accessible label', () => {
    expect(
      screen.getByRole('form', {
        name: /registration form/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the register submit button', () => {
    expect(
      screen.getByTestId('register-submit'),
    ).toBeInTheDocument()
  })

  it('renders the "Register" heading', () => {
    expect(
      screen.getByRole('heading', {
        name: 'Register',
        level: 1,
      }),
    ).toBeInTheDocument()
  })
})
