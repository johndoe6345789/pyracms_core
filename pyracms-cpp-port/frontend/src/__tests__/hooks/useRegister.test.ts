/**
 * @file useRegister.test.ts
 * Tests for the useRegister hook and its validateRegisterForm helper.
 *
 * Mocking strategy:
 *  - `@/lib/api`       — replaced with a jest mock so no HTTP
 *                        requests are made.
 *  - `next/navigation` — `useRouter` returns a mock with a `push`
 *                        spy so navigation can be asserted.
 *  - Redux store       — a fresh store is created with makeStore()
 *                        for each test and injected via a Provider
 *                        wrapper so useDispatch/useSelector work
 *                        normally.
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import {
  useRegister,
  validateRegisterForm,
} from '@/hooks/useRegister'
import type { RegisterRequest } from '@/types'

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

import api from '@/lib/api'
const mockPost = api.post as jest.MockedFunction<typeof api.post>

// ---------------------------------------------------------------------------
// Helper: fresh Redux Provider per test
// ---------------------------------------------------------------------------

/**
 * Creates a new Redux store and returns a renderHook wrapper that
 * provides it.  A fresh store per test prevents state leakage.
 */
function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode
  }) => React.createElement(Provider, { store, children })
  return { store, Wrapper }
}

/** Minimal mock user returned by a successful auth response. */
const MOCK_USER = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/**
 * A pre-filled form that passes all validation rules, including
 * the confirmPassword match check.
 */
const VALID_FORM: Required<RegisterRequest> = {
  username: 'bob',
  email: 'bob@example.com',
  password: 'secret99',
  confirmPassword: 'secret99',
  firstName: 'Bob',
  lastName: 'Smith',
}

/**
 * Fills every field in VALID_FORM (plus any overrides) via
 * updateField so that confirmPassword is always in sync and
 * the form passes validation before submission.
 *
 * @param result    - renderHook result from useRegister.
 * @param overrides - Optional field overrides applied on top of
 *   VALID_FORM.
 */
function fillValidForm(
  result: { current: ReturnType<typeof useRegister> },
  overrides: Partial<RegisterRequest> = {},
): void {
  const form = { ...VALID_FORM, ...overrides }
  Object.entries(form).forEach(([k, v]) => {
    if (v !== undefined) {
      result.current.updateField(
        k as keyof RegisterRequest,
        v,
      )
    }
  })
}

/** Fake e.preventDefault event object. */
const fakeEvent = () =>
  ({ preventDefault: jest.fn() } as unknown as React.FormEvent)

// ---------------------------------------------------------------------------
// validateRegisterForm — pure function, no React needed
// ---------------------------------------------------------------------------

describe('validateRegisterForm', () => {
  it('returns empty string for valid data', () => {
    expect(validateRegisterForm(VALID_FORM)).toBe('')
  })

  it('returns error when username is blank', () => {
    expect(
      validateRegisterForm({ ...VALID_FORM, username: '' }),
    ).toBe('Username is required')
  })

  it('returns error when username is whitespace only', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        username: '   ',
      }),
    ).toBe('Username is required')
  })

  it('returns error when email is blank', () => {
    expect(
      validateRegisterForm({ ...VALID_FORM, email: '' }),
    ).toBe('Email is required')
  })

  it('returns error when email has no @ symbol', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        email: 'notanemail',
      }),
    ).toBe('Invalid email address')
  })

  it('returns error when email has no domain part', () => {
    expect(
      validateRegisterForm({ ...VALID_FORM, email: 'a@b' }),
    ).toBe('Invalid email address')
  })

  it('returns error when password is empty', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: '',
        confirmPassword: '',
      }),
    ).toBe('Password is required')
  })

  it('returns error when password is fewer than 8 chars', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: 'abc12',
        confirmPassword: 'abc12',
      }),
    ).toBe('Password must be at least 8 characters')
  })

  it('accepts a password of exactly 8 characters', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        password: '12345678',
        confirmPassword: '12345678',
      }),
    ).toBe('')
  })

  it('returns error when confirmPassword does not match', () => {
    expect(
      validateRegisterForm({
        ...VALID_FORM,
        confirmPassword: 'different',
      }),
    ).toBe('Passwords do not match')
  })

  it('does not error when confirmPassword is undefined', () => {
    const { confirmPassword: _cp, ...noConfirm } = VALID_FORM
    expect(validateRegisterForm(noConfirm)).toBe('')
  })

  it('accepts optional firstName / lastName being absent', () => {
    const {
      firstName: _f,
      lastName: _l,
      ...minimal
    } = VALID_FORM
    expect(validateRegisterForm(minimal)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// useRegister
// ---------------------------------------------------------------------------

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  it('returns empty formData on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    expect(result.current.formData).toEqual({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    })
  })

  it('returns empty error and loading=false on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })

  // -----------------------------------------------------------------------
  // updateField
  // -----------------------------------------------------------------------

  it('updateField updates the username field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.username).toBe('carol')
  })

  it('updateField updates the email field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField(
        'email',
        'carol@example.com',
      )
    })
    expect(result.current.formData.email).toBe(
      'carol@example.com',
    )
  })

  it('updateField updates the password field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('password', 'newpass1')
    })
    expect(result.current.formData.password).toBe('newpass1')
  })

  it('updateField updates confirmPassword field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField(
        'confirmPassword',
        'newpass1',
      )
    })
    expect(result.current.formData.confirmPassword).toBe(
      'newpass1',
    )
  })

  it('updateField updates firstName', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('firstName', 'Carol')
    })
    expect(result.current.formData.firstName).toBe('Carol')
  })

  it('updateField updates lastName', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('lastName', 'Jones')
    })
    expect(result.current.formData.lastName).toBe('Jones')
  })

  it('updateField does not affect other fields', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
    })
    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
  })

  // -----------------------------------------------------------------------
  // Client-side validation (no API call)
  // -----------------------------------------------------------------------

  it('sets error and skips API when username is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Username is required')
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('sets error and skips API when email is invalid', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, { email: 'bademail' })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Invalid email address')
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('sets error and skips API when password is too short', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, {
        password: 'abc',
        confirmPassword: 'abc',
      })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Password must be at least 8 characters',
    )
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('sets error when confirmPassword does not match', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      fillValidForm(result, { confirmPassword: 'mismatch' })
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Passwords do not match',
    )
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('loading stays false after a validation failure', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Successful registration
  // -----------------------------------------------------------------------

  it('successful registration stores token in localStorage', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(localStorage.getItem('token')).toBe('regTok1')
  })

  it('successful registration dispatches setCredentials', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'regTok1', user: MOCK_USER },
    })
    const { store, Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    const auth = (
      store.getState() as { auth: { token: string } }
    ).auth
    expect(auth.token).toBe('regTok1')
  })

  it('navigates to default "/" path on success', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'regTok2', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('navigates to a custom redirectTo on success', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'regTok3', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRegister('/welcome'),
      { wrapper: Wrapper },
    )
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/welcome')
  })

  it('successful registration clears any previous error', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    // Trigger a validation error first
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBeTruthy()

    // Now fill the form correctly and succeed
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('')
  })

  // -----------------------------------------------------------------------
  // Server-side error response (token absent)
  // -----------------------------------------------------------------------

  it('sets error from response.data.error when token absent', async () => {
    mockPost.mockResolvedValueOnce({
      data: { error: 'Username already taken' },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Username already taken',
    )
  })

  it('falls back to "Registration failed" when no error msg', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Registration failed')
  })

  it('does not navigate when token is absent', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // HTTP / Axios error (caught exception with .response)
  // -----------------------------------------------------------------------

  it('sets server error message from caught axios error', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: { error: 'Email already registered' },
      },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Email already registered',
    )
  })

  it('falls back to "Registration failed" on axios err', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: {} },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Registration failed')
  })

  // -----------------------------------------------------------------------
  // Network error (no .response on the thrown object)
  // -----------------------------------------------------------------------

  it('sets "Unable to connect to server" on network error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  it('sets "Unable to connect to server" when err is string', async () => {
    mockPost.mockRejectedValueOnce('timeout')
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  // -----------------------------------------------------------------------
  // loading state lifecycle
  // -----------------------------------------------------------------------

  it('loading is false after successful request completes', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after failed request completes', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after server-side error (no token)', async () => {
    mockPost.mockResolvedValueOnce({
      data: { error: 'Taken' },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => { fillValidForm(result) })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  // -----------------------------------------------------------------------
  // API call shape — confirmPassword must be stripped from payload
  // -----------------------------------------------------------------------

  it('calls POST /api/auth/register without confirmPassword', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRegister(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'carol')
      result.current.updateField(
        'email',
        'carol@example.com',
      )
      result.current.updateField('password', 'securepass')
      result.current.updateField(
        'confirmPassword',
        'securepass',
      )
      result.current.updateField('firstName', 'Carol')
      result.current.updateField('lastName', 'Jones')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/api/auth/register',
      {
        username: 'carol',
        email: 'carol@example.com',
        password: 'securepass',
        firstName: 'Carol',
        lastName: 'Jones',
      },
    )
    const payload = mockPost.mock.calls[0][1] as Record<
      string,
      unknown
    >
    expect(payload).not.toHaveProperty('confirmPassword')
  })
})
