import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CreateSiteButton from '@/components/portal/CreateSiteButton'
import authReducer, { setCredentials } from '@/store/slices/authSlice'
import type { User } from '@/types'

/**
 * Build a minimal store containing only the auth slice.
 * We avoid makeStore() to sidestep redux-persist / localStorage
 * in jsdom.
 */
function makeAuthStore(isAuthenticated = false) {
  const store = configureStore({
    reducer: { auth: authReducer },
  })

  if (isAuthenticated) {
    const fakeUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      isActive: true,
      isAdmin: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    store.dispatch(setCredentials({ user: fakeUser, token: 'tok' }))
  }

  return store
}

export function renderButton(isAuthenticated = false) {
  const store = makeAuthStore(isAuthenticated)
  render(
    <Provider store={store}>
      <CreateSiteButton />
    </Provider>,
  )
}
