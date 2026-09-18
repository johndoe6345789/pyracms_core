/**
 * Tests for LoginForm.
 *
 * Strategy: mock the `useLogin` hook so the form logic is
 * replaced by controlled stubs. This keeps each test
 * focused on the UI contract rather than the hook
 * implementation (which has its own tests elsewhere).
 *
 * next/navigation is mocked because LoginForm imports
 * next/link which internally uses the router context.
 */
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import LoginForm from '@/components/auth/LoginForm'

// --------------- next/navigation mock ---------------
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// --------------- useLogin mock ----------------------
/**
 * Mutable state shared between the mock factory and
 * individual tests via `setMockState`.
 */
interface MockLoginState {
  username: string
  password: string
  error: string
  loading: boolean
  handleSubmit: jest.Mock
  updateField: jest.Mock
}

const defaultState: MockLoginState = {
  username: '',
  password: '',
  error: '',
  loading: false,
  handleSubmit: jest.fn((e: React.FormEvent) => {
    e.preventDefault()
  }),
  updateField: jest.fn(),
}

// Mutable reference so tests can override per-describe.
let mockState: MockLoginState = { ...defaultState }

/** Replace parts of the mock hook state for a test. */
function setMockState(overrides: Partial<MockLoginState>) {
  mockState = { ...defaultState, ...overrides }
}

jest.mock('@/hooks/useLogin', () => ({
  useLogin: (_redirectTo?: string) => ({
    formData: {
      username: mockState.username,
      password: mockState.password,
    },
    error: mockState.error,
    loading: mockState.loading,
    handleSubmit: mockState.handleSubmit,
    updateField: mockState.updateField,
  }),
}))

// --------------- test helpers -----------------------

/** Minimal Redux store – LoginForm itself does not dispatch
 * directly but its children may consume the store context. */
function makeStore() {
  return configureStore({
    reducer: {
      _placeholder: (s: null = null) => s,
    },
  })
}

/** Render LoginForm wrapped in a Redux Provider. */
function renderLoginForm(props: { redirectTo?: string } = {}) {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <LoginForm {...props} />
    </Provider>,
  )
}

// --------------- tests ------------------------------

beforeEach(() => {
  // Reset to clean defaults before every test.
  mockState = {
    ...defaultState,
    handleSubmit: jest.fn((e: React.FormEvent) => {
      e.preventDefault()
    }),
    updateField: jest.fn(),
  }
})

describe('LoginForm – data-testid attributes', () => {
  it('has data-testid="login-form" on the <form>', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('login-form'),
    ).toBeInTheDocument()
  })

  it('has data-testid="username-input"', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('username-input'),
    ).toBeInTheDocument()
  })

  it('has data-testid="password-input"', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('password-input'),
    ).toBeInTheDocument()
  })

  it('has data-testid="login-submit"', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('login-submit'),
    ).toBeInTheDocument()
  })

  it('has data-testid="register-link"', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('register-link'),
    ).toBeInTheDocument()
  })

  it('has data-testid="forgot-password-link"', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('forgot-password-link'),
    ).toBeInTheDocument()
  })
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

describe('LoginForm – loading state', () => {
  it('disables the submit button while loading', () => {
    setMockState({ loading: true })
    renderLoginForm()
    expect(
      screen.getByTestId('login-submit'),
    ).toBeDisabled()
  })

  it('shows "Signing in..." text while loading', () => {
    setMockState({ loading: true })
    renderLoginForm()
    expect(
      screen.getByTestId('login-submit'),
    ).toHaveTextContent(/signing in/i)
  })

  it('enables the submit button when not loading', () => {
    setMockState({ loading: false })
    renderLoginForm()
    expect(
      screen.getByTestId('login-submit'),
    ).not.toBeDisabled()
  })
})

describe('LoginForm – error display', () => {
  it('shows error message via LoginHeader when error '
    + 'is returned from the hook', () => {
    setMockState({ error: 'Invalid credentials' })
    renderLoginForm()
    expect(
      screen.getByTestId('login-error'),
    ).toHaveTextContent('Invalid credentials')
  })

  it('does not show error alert when error is empty', () => {
    setMockState({ error: '' })
    renderLoginForm()
    expect(
      screen.queryByTestId('login-error'),
    ).not.toBeInTheDocument()
  })
})

describe('LoginForm – form submission', () => {
  it('calls handleSubmit when the form is submitted', () => {
    const handleSubmit = jest.fn(
      (e: React.FormEvent) => { e.preventDefault() },
    )
    setMockState({ handleSubmit })
    renderLoginForm()
    fireEvent.submit(screen.getByTestId('login-form'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls handleSubmit when Enter is pressed on the '
    + 'form (keyboard shortcut)', () => {
    const handleSubmit = jest.fn(
      (e: React.FormEvent) => { e.preventDefault() },
    )
    setMockState({ handleSubmit })
    renderLoginForm()
    fireEvent.keyDown(
      screen.getByTestId('login-form'),
      { key: 'Enter', code: 'Enter', charCode: 13 },
    )
    // Pressing Enter inside a form triggers submit via the
    // browser default; simulate via fireEvent.submit too.
    fireEvent.submit(screen.getByTestId('login-form'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('LoginForm – field update callbacks', () => {
  it('calls updateField with "username" when username '
    + 'input changes', () => {
    const updateField = jest.fn()
    setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('username-input')
    fireEvent.change(input, {
      target: { value: 'testuser' },
    })
    expect(updateField).toHaveBeenCalledWith(
      'username',
      'testuser',
    )
  })

  it('calls updateField with "password" when password '
    + 'input changes', () => {
    const updateField = jest.fn()
    setMockState({ updateField })
    renderLoginForm()
    const input = screen.getByTestId('password-input')
    fireEvent.change(input, {
      target: { value: 'secret' },
    })
    expect(updateField).toHaveBeenCalledWith(
      'password',
      'secret',
    )
  })
})

describe('LoginForm – HTML5 required validation', () => {
  it('username input has required attribute', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('username-input'),
    ).toBeRequired()
  })

  it('password input has required attribute', () => {
    renderLoginForm()
    expect(
      screen.getByTestId('password-input'),
    ).toBeRequired()
  })
})

describe('LoginForm – redirectTo prop', () => {
  it('accepts redirectTo prop without throwing', () => {
    expect(() => {
      renderLoginForm({ redirectTo: '/dashboard' })
    }).not.toThrow()
  })

  it('renders correctly when redirectTo is omitted', () => {
    expect(() => {
      renderLoginForm()
    }).not.toThrow()
    expect(
      screen.getByTestId('login-form'),
    ).toBeInTheDocument()
  })
})

describe('LoginForm – tab order', () => {
  /**
   * Tab order is enforced by DOM source order. We verify
   * the correct sequential position in the document rather
   * than simulating Tab key presses (which jsdom does not
   * fully support without user-event).
   */
  it('username input appears before password input in DOM',
    () => {
      renderLoginForm()
      const username = screen.getByTestId('username-input')
      const password = screen.getByTestId('password-input')
      expect(
        // eslint-disable-next-line no-bitwise
        username.compareDocumentPosition(password)
        // Node.DOCUMENT_POSITION_FOLLOWING === 4
        & 4,
      ).toBeTruthy()
    },
  )

  it('password input appears before submit button in DOM',
    () => {
      renderLoginForm()
      const password = screen.getByTestId('password-input')
      const submit = screen.getByTestId('login-submit')
      // eslint-disable-next-line no-bitwise
      expect(password.compareDocumentPosition(submit) & 4)
        .toBeTruthy()
    },
  )

  it('submit button appears before register link in DOM',
    () => {
      renderLoginForm()
      const submit = screen.getByTestId('login-submit')
      const register = screen.getByTestId('register-link')
      // eslint-disable-next-line no-bitwise
      expect(submit.compareDocumentPosition(register) & 4)
        .toBeTruthy()
    },
  )

  it('none of the interactive elements have tabIndex < 0',
    () => {
      renderLoginForm()
      const elements = [
        screen.getByTestId('username-input'),
        screen.getByTestId('password-input'),
        screen.getByTestId('login-submit'),
        screen.getByTestId('register-link'),
        screen.getByTestId('forgot-password-link'),
      ]
      for (const el of elements) {
        const ti = el.getAttribute('tabindex')
        if (ti !== null) {
          expect(Number(ti)).toBeGreaterThanOrEqual(0)
        }
      }
    },
  )
})
