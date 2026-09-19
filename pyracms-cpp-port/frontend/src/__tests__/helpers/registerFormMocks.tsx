import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterForm from '@/components/auth/RegisterForm'
import { useRegister } from '@/hooks/useRegister'
import type { RegisterRequest } from '@/types'
import { asMockedFunction } from './mockFunction'

/** Shape returned by the useRegister mock. */
interface MockUseRegisterReturn {
  formData: RegisterRequest
  updateField: jest.Mock
  error: string
  loading: boolean
  handleSubmit: jest.Mock
}

export const mockHandleSubmit = jest.fn((e: React.FormEvent) =>
  e.preventDefault(),
)
export const mockUpdateField = jest.fn()

/** Defaults; tests override via mockState. */
export const defaultReturn: MockUseRegisterReturn = {
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

// Callers must jest.mock('@/hooks/useRegister') before importing this.
export const mockUseRegister = asMockedFunction(useRegister)

/** Resets mocks to defaults; call from beforeEach. */
export function resetRegisterMocks() {
  mockUseRegister.mockReturnValue(defaultReturn)
  mockHandleSubmit.mockClear()
  mockUpdateField.mockClear()
}

/** Overrides the useRegister return value. */
export function mockState(overrides: Partial<MockUseRegisterReturn>) {
  mockUseRegister.mockReturnValue({ ...defaultReturn, ...overrides })
}

/** Renders RegisterForm inside a reducer-less Redux Provider. */
export function renderForm(redirectTo?: string) {
  const store = configureStore({ reducer: { _stub: () => null } })
  render(
    <Provider store={store}>
      <RegisterForm redirectTo={redirectTo} />
    </Provider>,
  )
}
