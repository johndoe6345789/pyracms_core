import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import { useLogin } from '@/hooks/useLogin'
import type { LoginRequest } from '@/types'
import { makeMockFormEvent } from './mockFormEvent'

/**
 * Creates a new Redux store and returns a `renderHook` wrapper
 * that provides it. A fresh store per test prevents leakage.
 */
export function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children })
  return { store, Wrapper }
}

/** Minimal mock user returned by a successful auth response. */
export const MOCK_USER = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** A pre-filled form that passes validation. */
export const VALID_FORM: LoginRequest = {
  username: 'alice',
  password: 'secret123',
}

/** Fake `e.preventDefault` event object. */
export const fakeEvent = () => makeMockFormEvent().event

/** Render useLogin inside a fresh store provider. */
export function renderLogin(redirectTo?: string) {
  const { store, Wrapper } = makeWrapper()
  const { result } = renderHook(() => useLogin(redirectTo), {
    wrapper: Wrapper,
  })
  return { store, result }
}

export type LoginResult = ReturnType<typeof renderLogin>['result']

/** Fill the form with the given (default valid) values. */
export function fillForm(
  result: LoginResult,
  username: string = VALID_FORM.username,
  password: string = VALID_FORM.password,
) {
  act(() => {
    result.current.updateField('username', username)
    result.current.updateField('password', password)
  })
}

/** Submit the form through the hook. */
export async function submitForm(result: LoginResult) {
  await act(async () => {
    await result.current.handleSubmit(fakeEvent())
  })
}
