import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import CreateSitePage from '@/app/create-site/page'

/** Build a minimal test store with the auth slice only. */
function makeTestStore(isAuthenticated: boolean) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { isAuthenticated, user: null, token: null },
    },
  })
}

/** Render CreateSitePage wrapped in a test store. */
export function renderPage(isAuthenticated: boolean) {
  const store = makeTestStore(isAuthenticated)
  return render(
    <Provider store={store}>
      <CreateSitePage />
    </Provider>,
  )
}
