/**
 * Tests for /auth/register/create-site (RegisterForm with
 * redirectTo). The hooks that make network calls are mocked at
 * module level.
 */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderWithStore } from '../../helpers/createSiteAuthRender'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

import RegisterCreateSitePage from '@/app/auth/register/create-site/page'

describe('/auth/register/create-site page', () => {
  beforeEach(() => renderWithStore(<RegisterCreateSitePage />))

  it('renders the auth page shell (role=main)', () => {
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the register form', () => {
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('register form has accessible label', () => {
    expect(
      screen.getByRole('form', {
        name: /registration form/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the register submit button', () => {
    expect(screen.getByTestId('register-submit')).toBeInTheDocument()
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
