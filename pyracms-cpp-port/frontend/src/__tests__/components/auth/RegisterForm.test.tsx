/**
 * Tests for RegisterForm component.
 *
 * useRegister is fully mocked so these tests exercise only the
 * presentational and wiring logic inside RegisterForm itself.
 *
 * Covers:
 * - Heading text "Register"
 * - No error alert in default (happy-path) state
 * - Error alert appearance, id, role, and aria-live attributes
 * - Submit button label changes: "Register" / "Registering..."
 * - Submit button is disabled while loading
 * - Login link href and aria-label
 * - data-testid attributes: register-form, register-submit,
 *   register-error, login-link
 * - redirectTo prop is forwarded to useRegister
 * - handleSubmit is called on form submission
 */
import React from 'react'
import {
  render,
  screen,
  fireEvent,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterForm from '@/components/auth/RegisterForm'
import type { RegisterRequest } from '@/types'

// ---------------------------------------------------------------------------
// Mock useRegister
// ---------------------------------------------------------------------------

/** Shape returned by the useRegister mock. */
interface MockUseRegisterReturn {
  formData: RegisterRequest
  updateField: jest.Mock
  error: string
  loading: boolean
  handleSubmit: jest.Mock
}

const mockHandleSubmit = jest.fn((e: React.FormEvent) =>
  e.preventDefault(),
)
const mockUpdateField = jest.fn()

/** Mutable defaults – individual tests can override via mockReturnValue. */
const defaultReturn: MockUseRegisterReturn = {
  formData: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  },
  updateField: mockUpdateField,
  error: '',
  loading: false,
  handleSubmit: mockHandleSubmit,
}

jest.mock('@/hooks/useRegister', () => ({
  useRegister: jest.fn(),
}))

// Import after mock so we can control the return value.
import { useRegister } from '@/hooks/useRegister'
const mockUseRegister = useRegister as jest.MockedFunction<
  typeof useRegister
>

// ---------------------------------------------------------------------------
// Redux store stub (RegisterForm only reads from the store via useDispatch;
// no real reducers are needed for these tests.)
// ---------------------------------------------------------------------------

/**
 * Creates a minimal Redux store with no reducers.
 * Sufficient for wrapping components that call useDispatch but don't
 * need to read state.
 */
function makeTestStore() {
  return configureStore({ reducer: { _stub: () => null } })
}

/**
 * Renders RegisterForm inside a Redux Provider.
 *
 * @param redirectTo - Optional redirectTo prop forwarded to the form.
 */
function renderForm(redirectTo?: string) {
  const store = makeTestStore()
  render(
    <Provider store={store}>
      <RegisterForm redirectTo={redirectTo} />
    </Provider>,
  )
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockUseRegister.mockReturnValue(defaultReturn)
  mockHandleSubmit.mockClear()
  mockUpdateField.mockClear()
})

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

describe('RegisterForm – heading', () => {
  it('renders a heading with text "Register"', () => {
    renderForm()
    expect(
      screen.getByRole('heading', { name: /register/i }),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Error alert
// ---------------------------------------------------------------------------

describe('RegisterForm – error alert', () => {
  it('does not show an error alert by default', () => {
    renderForm()
    expect(
      screen.queryByTestId('register-error'),
    ).not.toBeInTheDocument()
  })

  it('shows error alert when error is non-empty', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'Username already taken',
    })
    renderForm()
    expect(
      screen.getByTestId('register-error'),
    ).toBeInTheDocument()
  })

  it('error alert displays the error message text', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'Something went wrong',
    })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveTextContent(
      'Something went wrong',
    )
  })

  it('error alert has id="register-error-msg"', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'err',
    })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'id',
      'register-error-msg',
    )
  })

  it('error alert has role="alert"', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'err',
    })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'role',
      'alert',
    )
  })

  it('error alert has aria-live="assertive"', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'err',
    })
    renderForm()
    expect(screen.getByTestId('register-error')).toHaveAttribute(
      'aria-live',
      'assertive',
    )
  })
})

// ---------------------------------------------------------------------------
// Submit button
// ---------------------------------------------------------------------------

describe('RegisterForm – submit button', () => {
  it('shows "Register" text when not loading', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveTextContent('Register')
  })

  it('shows "Registering..." text when loading', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      loading: true,
    })
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveTextContent('Registering...')
  })

  it('is enabled when not loading', () => {
    renderForm()
    expect(screen.getByTestId('register-submit')).not.toBeDisabled()
  })

  it('is disabled when loading', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      loading: true,
    })
    renderForm()
    expect(screen.getByTestId('register-submit')).toBeDisabled()
  })

  it('has aria-label "Register" when not loading', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveAttribute('aria-label', 'Register')
  })

  it('has aria-label "Registering" when loading', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      loading: true,
    })
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toHaveAttribute('aria-label', 'Registering')
  })
})

// ---------------------------------------------------------------------------
// Login link
// ---------------------------------------------------------------------------

describe('RegisterForm – login link', () => {
  it('has data-testid="login-link"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toBeInTheDocument()
  })

  it('href points to "/auth/login"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })

  it('has aria-label "Go to login page"', () => {
    renderForm()
    expect(screen.getByTestId('login-link')).toHaveAttribute(
      'aria-label',
      'Go to login page',
    )
  })
})

// ---------------------------------------------------------------------------
// data-testid attributes
// ---------------------------------------------------------------------------

describe('RegisterForm – data-testid attributes', () => {
  it('form has data-testid="register-form"', () => {
    renderForm()
    expect(
      screen.getByTestId('register-form'),
    ).toBeInTheDocument()
  })

  it('submit button has data-testid="register-submit"', () => {
    renderForm()
    expect(
      screen.getByTestId('register-submit'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// redirectTo prop
// ---------------------------------------------------------------------------

describe('RegisterForm – redirectTo prop', () => {
  it('passes redirectTo to useRegister when provided', () => {
    renderForm('/dashboard')
    expect(mockUseRegister).toHaveBeenCalledWith('/dashboard')
  })

  it('passes undefined to useRegister when redirectTo is omitted', () => {
    renderForm()
    expect(mockUseRegister).toHaveBeenCalledWith(undefined)
  })
})

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

describe('RegisterForm – form submission', () => {
  it('calls handleSubmit when form is submitted', () => {
    renderForm()
    const form = screen.getByTestId('register-form')
    fireEvent.submit(form)
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// RegisterFields integration (password strength + confirm password)
// ---------------------------------------------------------------------------

describe('RegisterForm – confirm-password field integration', () => {
  it('renders the confirm-password input', () => {
    renderForm()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toBeInTheDocument()
  })

  it('calls updateField("confirmPassword", …) on input change', () => {
    renderForm()
    fireEvent.change(
      screen.getByTestId('register-confirm-password-input'),
      { target: { value: 'MyPass1!' } },
    )
    expect(mockUpdateField).toHaveBeenCalledWith(
      'confirmPassword',
      'MyPass1!',
    )
  })
})

describe('RegisterForm – password strength indicator integration', () => {
  it('shows strength indicator when password is non-empty', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        password: 'Abcdef1!',
      },
    })
    renderForm()
    expect(
      screen.getByTestId('password-strength'),
    ).toBeInTheDocument()
  })

  it('does not show strength indicator when password is empty', () => {
    renderForm()
    expect(
      screen.queryByTestId('password-strength'),
    ).not.toBeInTheDocument()
  })

  it('strength label says "Strong" for a complex password', () => {
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        password: 'Abcdef1!',
      },
    })
    renderForm()
    expect(
      screen.getByTestId('password-strength-label'),
    ).toHaveTextContent('Strong')
  })

  it('errorId prop wires aria-describedby when error is present', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not on the native <input>.
    mockUseRegister.mockReturnValue({
      ...defaultReturn,
      error: 'Registration failed',
    })
    renderForm()
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute(
      'aria-describedby',
      'register-error-msg',
    )
  })

  it('errorId prop is absent (no wrapper) when no error', () => {
    renderForm()
    const input = screen.getByTestId('register-username-input')
    expect(input.closest('[aria-describedby]')).toBeNull()
  })
})
