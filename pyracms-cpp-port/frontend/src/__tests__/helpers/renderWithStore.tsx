import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import type { User } from '@/types'

export const makeUser = (over: Partial<User> = {}): User => ({
  id: 1, username: 'alice', email: 'a@x.io', isActive: true,
  isAdmin: false, createdAt: '', updatedAt: '', ...over,
})

/** Renders `ui` in a fresh store, optionally signed in as `user`. */
export function renderWithStore(ui: React.ReactElement, user?: User) {
  const { store } = makeStore()
  if (user) store.dispatch(setCredentials({ user, token: 't' }))
  return { store, ...render(<Provider store={store}>{ui}</Provider>) }
}
