import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setCredentials } from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'
import type { User } from '@/types'

/** Like renderWithStore, but without redux-persist (no cross-test state). */
export function renderPlain(ui: React.ReactElement, user?: User) {
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  })
  if (user) store.dispatch(setCredentials({ user, token: 't' }))
  return { store, ...render(<Provider store={store}>{ui}</Provider>) }
}
