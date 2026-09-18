/**
 * Tests for RegisterFields component.
 *
 * Covers:
 * - Presence and data-testid of all six input fields
 * - Correct aria-label on each input
 * - onChange fires updateField with the correct key and value
 * - aria-describedby wired to errorId when provided
 * - No aria-describedby when errorId is absent
 * - Password strength indicator visibility and labels
 * - Confirm-password field presence and onChange
 */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RegisterFields, {
  passwordStrength,
  type StrengthScore,
} from '@/components/auth/RegisterFields'
import type { RegisterRequest } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default empty form data used across tests. */
const emptyForm: RegisterRequest = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
}

/** Renders RegisterFields with optional prop overrides. */
function setup(
  overrides: Partial<RegisterRequest> = {},
  updateField = jest.fn(),
  errorId?: string,
) {
  const formData: RegisterRequest = { ...emptyForm, ...overrides }
  render(
    <RegisterFields
      formData={formData}
      updateField={updateField}
      errorId={errorId}
    />,
  )
  return { updateField }
}

// ---------------------------------------------------------------------------
// passwordStrength pure-function tests
// ---------------------------------------------------------------------------

describe('passwordStrength()', () => {
  it('returns 0 for an empty string', () => {
    expect(passwordStrength('')).toBe(0 as StrengthScore)
  })

  it('returns 1 for a short lower-case string', () => {
    // Only lower-case letters, less than 8 chars → 1 point (lowercase)
    expect(passwordStrength('abc')).toBe(1 as StrengthScore)
  })

  it('returns 2 when ≥8 chars but only lowercase', () => {
    // length + lowercase = 2
    expect(passwordStrength('abcdefgh')).toBe(2 as StrengthScore)
  })

  it('returns 3 when ≥8 chars, lowercase, and a digit', () => {
    expect(passwordStrength('abcdefg1')).toBe(3 as StrengthScore)
  })

  it('returns 4 for a fully complex password', () => {
    expect(passwordStrength('Abcdef1!')).toBe(4 as StrengthScore)
  })

  it('counts uppercase as the fourth criterion (needs lower too)', () => {
    // 'abcdef1A' → length(1) + digit(1) + lowercase(1) + uppercase(1) = 4
    expect(passwordStrength('abcdef1A')).toBe(4 as StrengthScore)
  })

  it('returns 3 for all-uppercase with digit (no lowercase)', () => {
    // 'ABCDEF1!' → length(1) + digit(1) + uppercase/special(1) = 3
    // (no lowercase → only 3 points)
    expect(passwordStrength('ABCDEF1!')).toBe(3 as StrengthScore)
  })
})

// ---------------------------------------------------------------------------
// Field rendering
// ---------------------------------------------------------------------------

describe('RegisterFields – field rendering', () => {
  it('renders the username input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-username-input'),
    ).toBeInTheDocument()
  })

  it('renders the email input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-email-input'),
    ).toBeInTheDocument()
  })

  it('renders the password input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-password-input'),
    ).toBeInTheDocument()
  })

  it('renders the confirm-password input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toBeInTheDocument()
  })

  it('renders the first-name input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-firstname-input'),
    ).toBeInTheDocument()
  })

  it('renders the last-name input with correct data-testid', () => {
    setup()
    expect(
      screen.getByTestId('register-lastname-input'),
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Aria labels
// ---------------------------------------------------------------------------

describe('RegisterFields – aria-labels', () => {
  it('username input has aria-label "Username"', () => {
    setup()
    expect(
      screen.getByTestId('register-username-input'),
    ).toHaveAttribute('aria-label', 'Username')
  })

  it('email input has aria-label "Email address"', () => {
    setup()
    expect(
      screen.getByTestId('register-email-input'),
    ).toHaveAttribute('aria-label', 'Email address')
  })

  it('password input has aria-label "Password"', () => {
    setup()
    expect(
      screen.getByTestId('register-password-input'),
    ).toHaveAttribute('aria-label', 'Password')
  })

  it('confirm-password input has aria-label "Confirm password"', () => {
    setup()
    expect(
      screen.getByTestId('register-confirm-password-input'),
    ).toHaveAttribute('aria-label', 'Confirm password')
  })

  it('first-name input has aria-label "First name"', () => {
    setup()
    expect(
      screen.getByTestId('register-firstname-input'),
    ).toHaveAttribute('aria-label', 'First name')
  })

  it('last-name input has aria-label "Last name"', () => {
    setup()
    expect(
      screen.getByTestId('register-lastname-input'),
    ).toHaveAttribute('aria-label', 'Last name')
  })
})

// ---------------------------------------------------------------------------
// onChange → updateField
// ---------------------------------------------------------------------------

describe('RegisterFields – onChange callbacks', () => {
  it('calls updateField("username", value) on username change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-username-input'),
      { target: { value: 'alice' } },
    )
    expect(updateField).toHaveBeenCalledWith('username', 'alice')
  })

  it('calls updateField("email", value) on email change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-email-input'),
      { target: { value: 'alice@example.com' } },
    )
    expect(updateField).toHaveBeenCalledWith(
      'email',
      'alice@example.com',
    )
  })

  it('calls updateField("password", value) on password change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-password-input'),
      { target: { value: 'secret123' } },
    )
    expect(updateField).toHaveBeenCalledWith('password', 'secret123')
  })

  it('calls updateField("confirmPassword", value) on confirm change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-confirm-password-input'),
      { target: { value: 'secret123' } },
    )
    expect(updateField).toHaveBeenCalledWith(
      'confirmPassword',
      'secret123',
    )
  })

  it('calls updateField("firstName", value) on firstName change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-firstname-input'),
      { target: { value: 'Alice' } },
    )
    expect(updateField).toHaveBeenCalledWith('firstName', 'Alice')
  })

  it('calls updateField("lastName", value) on lastName change', () => {
    const { updateField } = setup()
    fireEvent.change(
      screen.getByTestId('register-lastname-input'),
      { target: { value: 'Smith' } },
    )
    expect(updateField).toHaveBeenCalledWith('lastName', 'Smith')
  })
})

// ---------------------------------------------------------------------------
// aria-describedby / errorId
// ---------------------------------------------------------------------------

describe('RegisterFields – aria-describedby', () => {
  it('sets aria-describedby on username wrapper when errorId provided', () => {
    // MUI places aria-describedby on the FormControl root <div>,
    // not directly on the <input> element.
    setup({}, jest.fn(), 'register-error-msg')
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toHaveAttribute(
      'aria-describedby',
      'register-error-msg',
    )
  })

  it('has no aria-describedby ancestor on username when errorId absent', () => {
    setup()
    const input = screen.getByTestId('register-username-input')
    const wrapper = input.closest('[aria-describedby]')
    expect(wrapper).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Password strength indicator
// ---------------------------------------------------------------------------

describe('RegisterFields – password strength indicator', () => {
  it('does not show strength bar when password is empty', () => {
    setup({ password: '' })
    expect(
      screen.queryByTestId('password-strength'),
    ).not.toBeInTheDocument()
  })

  it('shows strength bar when password has content', () => {
    setup({ password: 'abc' })
    expect(
      screen.getByTestId('password-strength'),
    ).toBeInTheDocument()
  })

  it('strength bar has role="status" and aria-live="polite"', () => {
    setup({ password: 'abc' })
    const bar = screen.getByTestId('password-strength')
    expect(bar).toHaveAttribute('role', 'status')
    expect(bar).toHaveAttribute('aria-live', 'polite')
  })

  it('shows "Weak" label for a short password', () => {
    setup({ password: 'abc' })
    expect(
      screen.getByTestId('password-strength-label'),
    ).toHaveTextContent('Weak')
  })

  it('shows "Strong" label for a fully complex password', () => {
    setup({ password: 'Abcdef1!' })
    expect(
      screen.getByTestId('password-strength-label'),
    ).toHaveTextContent('Strong')
  })

  it('aria-label contains strength text', () => {
    setup({ password: 'Abcdef1!' })
    expect(
      screen.getByTestId('password-strength'),
    ).toHaveAttribute('aria-label', 'Password strength: Strong')
  })
})
