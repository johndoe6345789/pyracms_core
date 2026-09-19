import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import { useRegister } from '@/hooks/useRegister'
import type { RegisterRequest } from '@/types'
import api from '@/lib/api'
import { asMockApi } from './mockApi'
import { makeMockFormEvent } from './mockFormEvent'

// Callers must jest.mock('@/lib/api') before importing this.
export const mockApi = asMockApi<'post'>(api)

/** Minimal mock user returned by a successful auth response. */
export const MOCK_USER = {
  id: 2,
  username: 'bob',
  email: 'bob@example.com',
  isActive: true,
  isAdmin: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

/** A pre-filled form that passes all validation rules. */
export const VALID_FORM: Required<RegisterRequest> = {
  username: 'bob',
  email: 'bob@example.com',
  password: 'secret99',
  confirmPassword: 'secret99',
  firstName: 'Bob',
  lastName: 'Smith',
}

type HookResult = { current: ReturnType<typeof useRegister> }

/** Fresh store + renderHook wrapper (no state leakage). */
export function makeWrapper() {
  const { store } = makeStore()
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children })
  return { store, Wrapper }
}

/** Renders useRegister in a fresh Redux Provider. */
export function renderRegister(redirectTo?: string) {
  const { store, Wrapper } = makeWrapper()
  const { result } = renderHook(() => useRegister(redirectTo), {
    wrapper: Wrapper,
  })
  return { store, result }
}

/** Fills every VALID_FORM field (plus overrides) via updateField. */
export function fillValidForm(
  result: HookResult,
  overrides: Partial<RegisterRequest> = {},
): void {
  const form = { ...VALID_FORM, ...overrides }
  Object.entries(form).forEach(([k, v]) => {
    if (v !== undefined) {
      result.current.updateField(k as keyof RegisterRequest, v)
    }
  })
}

export function fill(
  result: HookResult,
  overrides: Partial<RegisterRequest> = {},
): void {
  act(() => {
    fillValidForm(result, overrides)
  })
}

export async function submit(result: HookResult) {
  await act(async () => {
    await result.current.handleSubmit(makeMockFormEvent().event)
  })
}
