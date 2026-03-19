/**
 * @file useLogin.test.ts
 * Tests for the useLogin hook and its validateLoginForm helper.
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
  useLogin,
  validateLoginForm,
} from '@/hooks/useLogin'
import type { LoginRequest } from '@/types'

// ---------------------------------------------------------------------------
// Module-level mocks (hoisted by Jest before any imports are evaluated)
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

// Typed reference to the mocked axios instance
import api from '@/lib/api'
const mockPost = api.post as jest.MockedFunction<typeof api.post>

// ---------------------------------------------------------------------------
// Helper: wrap renderHook with a fresh Redux Provider each time
// ---------------------------------------------------------------------------

/**
 * Creates a new Redux store and returns a `renderHook` wrapper that
 * provides it.  A fresh store per test prevents state leakage.
 */
function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode
  }) => React.createElement(Provider, { store }, children)
  return { store, Wrapper }
}

/** Minimal mock user returned by a successful auth response. */
const MOCK_USER = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** A pre-filled form that passes validation. */
const VALID_FORM: LoginRequest = {
  username: 'alice',
  password: 'secret123',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fake `e.preventDefault` event object. */
const fakeEvent = () =>
  ({ preventDefault: jest.fn() } as unknown as React.FormEvent)

// ---------------------------------------------------------------------------
// validateLoginForm — pure function, no React needed
// ---------------------------------------------------------------------------

describe('validateLoginForm', () => {
  it('returns empty string for valid data', () => {
    expect(validateLoginForm(VALID_FORM)).toBe('')
  })

  it('returns error when username is blank', () => {
    expect(
      validateLoginForm({ username: '  ', password: 'x' }),
    ).toBe('Username is required')
  })

  it('returns error when username is empty string', () => {
    expect(
      validateLoginForm({ username: '', password: 'x' }),
    ).toBe('Username is required')
  })

  it('returns error when password is empty', () => {
    expect(
      validateLoginForm({ username: 'alice', password: '' }),
    ).toBe('Password is required')
  })
})

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  it('returns empty formData on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    expect(result.current.formData).toEqual({
      username: '',
      password: '',
    })
  })

  it('returns empty error and loading=false on mount', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    expect(result.current.error).toBe('')
    expect(result.current.loading).toBe(false)
  })

  // -------------------------------------------------------------------------
  // updateField
  // -------------------------------------------------------------------------

  it('updateField updates the username field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
    })
    expect(result.current.formData.username).toBe('alice')
  })

  it('updateField updates the password field', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('password', 'hunter2')
    })
    expect(result.current.formData.password).toBe('hunter2')
  })

  it('updateField does not affect other fields', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'bob')
    })
    expect(result.current.formData.password).toBe('')
  })

  // -------------------------------------------------------------------------
  // Client-side validation (no API call)
  // -------------------------------------------------------------------------

  it('sets error and does not call API when username is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Username is required')
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('sets error and does not call API when password is empty', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Password is required')
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('loading stays false after a validation failure', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Successful login
  // -------------------------------------------------------------------------

  it('successful login stores token in localStorage', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(localStorage.getItem('token')).toBe('tok123')
  })

  it('successful login dispatches setCredentials to the store', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { store, Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    const auth = (store.getState() as { auth: { token: string } })
      .auth
    expect(auth.token).toBe('tok123')
  })

  it('successful login navigates to default "/" path', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('successful login navigates to a custom redirectTo path', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok456', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useLogin('/dashboard'),
      { wrapper: Wrapper },
    )
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('successful login clears any previous error', async () => {
    // First trigger a validation error…
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBeTruthy()

    // …then supply valid data and a successful response
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok789', user: MOCK_USER },
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('')
  })

  // -------------------------------------------------------------------------
  // Server-side error response (token absent)
  // -------------------------------------------------------------------------

  it('sets error from response.data.error when token is absent', async () => {
    mockPost.mockResolvedValueOnce({
      data: { error: 'Invalid credentials' },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Invalid credentials')
  })

  it('falls back to "Login failed" when token absent and no error msg', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Login failed')
  })

  it('does not navigate when token is absent', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // HTTP / Axios error (caught exception with .response)
  // -------------------------------------------------------------------------

  it('sets server error message from caught axios error', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { error: 'Account locked' } },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Account locked')
  })

  it('falls back to "Login failed" on axios error with no message', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: {} } })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe('Login failed')
  })

  // -------------------------------------------------------------------------
  // Network error (no .response on the thrown object)
  // -------------------------------------------------------------------------

  it('sets "Unable to connect to server" on a network error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  it('sets "Unable to connect to server" when error is a string', async () => {
    mockPost.mockRejectedValueOnce('timeout')
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.error).toBe(
      'Unable to connect to server',
    )
  })

  // -------------------------------------------------------------------------
  // loading state lifecycle
  // -------------------------------------------------------------------------

  it('loading is false after a successful request completes', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok123', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a failed request completes', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  it('loading is false after a server-side error (no token)', async () => {
    mockPost.mockResolvedValueOnce({
      data: { error: 'Bad creds' },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', VALID_FORM.username)
      result.current.updateField('password', VALID_FORM.password)
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(result.current.loading).toBe(false)
  })

  // -------------------------------------------------------------------------
  // API call shape
  // -------------------------------------------------------------------------

  it('calls POST /api/auth/login with the form data', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', user: MOCK_USER },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLogin(), {
      wrapper: Wrapper,
    })
    act(() => {
      result.current.updateField('username', 'alice')
      result.current.updateField('password', 'pass123')
    })
    await act(async () => {
      await result.current.handleSubmit(fakeEvent())
    })
    expect(mockPost).toHaveBeenCalledWith(
      '/api/auth/login',
      { username: 'alice', password: 'pass123' },
    )
  })
})
