import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterForm from '@/components/auth/RegisterForm'
import { useRegister } from '@/hooks/useRegister'
import { asMockedFunction } from './mockFunction'

export const mockUseRegister = asMockedFunction(useRegister)
export const mockHandleSubmit = jest.fn((e: React.FormEvent) =>
  e.preventDefault(),
)
export const mockUpdateField = jest.fn()

export const defaultReturn = {
  formData: {
    username: '', email: '', password: '',
    confirmPassword: '', firstName: '', lastName: '',
  },
  updateField: mockUpdateField,
  error: '',
  loading: false,
  handleSubmit: mockHandleSubmit,
}

/** Reset mocks; call from beforeEach. */
export function resetRegister() {
  mockUseRegister.mockReturnValue(defaultReturn)
  mockHandleSubmit.mockClear()
  mockUpdateField.mockClear()
}

/** Override the hook return for a test. */
export const withReturn = (o: Partial<typeof defaultReturn>) =>
  mockUseRegister.mockReturnValue({ ...defaultReturn, ...o })

export function renderForm(redirectTo?: string) {
  const store = configureStore({ reducer: { _stub: () => null } })
  render(
    <Provider store={store}>
      <RegisterForm redirectTo={redirectTo} />
    </Provider>,
  )
}
