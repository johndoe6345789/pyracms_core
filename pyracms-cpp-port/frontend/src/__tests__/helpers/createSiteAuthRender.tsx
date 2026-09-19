import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'

/** Renders ui in a fresh auth-only store (no persistence). */
export function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({ reducer: { auth: authReducer } })
  render(<Provider store={store}>{ui}</Provider>)
}
