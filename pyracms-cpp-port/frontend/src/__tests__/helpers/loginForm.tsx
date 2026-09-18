import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import LoginForm from '@/components/auth/LoginForm'

export const navMock = {
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}

const submitStub = () =>
  jest.fn((e: React.FormEvent) => { e.preventDefault() })

export const makeState = () => ({
  username: '', password: '', error: '', loading: false,
  handleSubmit: submitStub(), updateField: jest.fn(),
})

export type MockLoginState = ReturnType<typeof makeState>
export const submitMock = submitStub

let mockState: MockLoginState = makeState()

export const resetState = () => { mockState = makeState() }
export const setMockState = (o: Partial<MockLoginState>) => {
  mockState = { ...makeState(), ...o }
}

export const useLoginMock = () => ({
  formData: {
    username: mockState.username, password: mockState.password,
  },
  error: mockState.error,
  loading: mockState.loading,
  handleSubmit: mockState.handleSubmit,
  updateField: mockState.updateField,
})

export function renderLoginForm(props: { redirectTo?: string } = {}) {
  const store = configureStore({
    reducer: { _placeholder: (s: null = null) => s },
  })
  return render(
    <Provider store={store}><LoginForm {...props} /></Provider>,
  )
}
