import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useTheme } from '@mui/material/styles'
import ThemeWrapper from '@/components/common/ThemeWrapper'
import authReducer from '@/store/slices/authSlice'
import uiReducer, { setColorMode } from '@/store/slices/uiSlice'
import api from '@/lib/api'

jest.mock('next/navigation', () => ({ usePathname: () => '/site/dflt/x' }))
jest.mock('@/hooks/useAuthHydration', () => ({ useAuthHydration: jest.fn() }))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 9, loading: false }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = (api as unknown as { get: jest.Mock }).get

const Probe = () => <p data-testid="m">{useTheme().palette.mode}</p>

function show(mode: 'system' | 'light') {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  })
  store.dispatch(setColorMode(mode))
  render(
    <Provider store={store}>
      <ThemeWrapper>
        <Probe />
      </ThemeWrapper>
    </Provider>,
  )
}

beforeEach(() => {
  get.mockImplementation((url: string) =>
    url.startsWith('/api/settings?')
      ? Promise.resolve({ data: [{ name: 'default_theme', value: 'dark' }] })
      : Promise.reject(new Error('none')),
  )
})

it('uses the site default mode until the visitor chooses', async () => {
  show('system')
  await waitFor(() => expect(screen.getByTestId('m')).toHaveTextContent('dark'))
})
