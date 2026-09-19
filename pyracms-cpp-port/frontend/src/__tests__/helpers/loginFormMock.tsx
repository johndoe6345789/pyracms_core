import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import LoginForm from '@/components/auth/LoginForm'

export interface MockLoginState {
  username: string
  password: string
  error: string
  loading: boolean
  handleSubmit: jest.Mock
  updateField: jest.Mock
}

function freshState(): MockLoginState {
  return {
    username: '',
    password: '',
    error: '',
    loading: false,
    handleSubmit: jest.fn((e: React.FormEvent) => {
      e.preventDefault()
    }),
    updateField: jest.fn(),
  }
}

let current: MockLoginState = freshState()

export function resetMockState() {
  current = freshState()
}

/** Replace parts of the mock hook state for a test. */
export function setMockState(o: Partial<MockLoginState>) {
  current = { ...freshState(), ...o }
}

/** Module factory for jest.mock('@/hooks/useLogin'). */
export function loginHookModule() {
  return {
    useLogin: (_redirectTo?: string) => ({
      formData: {
        username: current.username,
        password: current.password,
      },
      error: current.error,
      loading: current.loading,
      handleSubmit: current.handleSubmit,
      updateField: current.updateField,
    }),
  }
}

/** Module factory for jest.mock('next/navigation'). */
export function navigationModule() {
  return {
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }
}

function makeStore() {
  return configureStore({
    reducer: { _placeholder: (s: null = null) => s },
  })
}

/** Render LoginForm wrapped in a Redux Provider. */
export function renderLoginForm(
  props: { redirectTo?: string } = {},
) {
  return render(
    <Provider store={makeStore()}>
      <LoginForm {...props} />
    </Provider>,
  )
}
