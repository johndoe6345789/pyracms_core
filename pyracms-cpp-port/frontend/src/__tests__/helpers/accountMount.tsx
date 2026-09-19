import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import AccountSettings from '@/components/users/AccountSettings'

const user = { id: 4, username: 'u' }

/** Mount AccountSettings with a signed-in or guest store. */
export function mount(signedIn = true) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: signedIn
        ? { user: user as never, token: 'old', isAuthenticated: true }
        : { user: null, token: null, isAuthenticated: false },
    },
  })
  render(
    <Provider store={store}>
      <AccountSettings loginHref="/l" />
    </Provider>,
  )
  return store
}
