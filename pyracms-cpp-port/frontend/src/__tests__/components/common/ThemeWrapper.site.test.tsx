import { render, screen, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useTheme } from '@mui/material/styles'
import ThemeWrapper from '@/components/common/ThemeWrapper'
import { announceSiteTheme } from '@/hooks/useSiteTheme'
import authReducer from '@/store/slices/authSlice'
import uiReducer, { setColorMode } from '@/store/slices/uiSlice'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'
import { DEFAULT_DARK_THEME } from '@/components/admin/styles/siteThemes'
import api from '@/lib/api'

let path = '/site/wrap/x'
jest.mock('next/navigation', () => ({ usePathname: () => path }))
jest.mock('@/hooks/useAuthHydration', () => ({ useAuthHydration: jest.fn() }))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 3, loading: false }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = (api as unknown as { get: jest.Mock }).get

function Probe() {
  return <p data-testid="c">{useTheme().palette.primary.main}</p>
}
function show() {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  })
  store.dispatch(setColorMode('light'))
  return render(
    <Provider store={store}>
      <ThemeWrapper>
        <Probe />
      </ThemeWrapper>
    </Provider>,
  )
}

it('applies the saved site theme, then a freshly saved one', async () => {
  get.mockResolvedValue({
    data: {
      // the old single-theme format still applies (as the light look)
      value: JSON.stringify({ ...DEFAULT_THEME, primaryColor: '#123456' }),
    },
  })
  show()
  await waitFor(() =>
    expect(screen.getByTestId('c')).toHaveTextContent('#123456'),
  )
  expect(get).toHaveBeenCalledWith('/api/settings/site_theme?tenant_id=3')
  act(() =>
    announceSiteTheme('wrap', {
      light: { ...DEFAULT_THEME, primaryColor: '#abcdef' },
      dark: DEFAULT_DARK_THEME,
    }),
  )
  expect(screen.getByTestId('c')).toHaveTextContent('#abcdef')
})

it('falls back to built-in defaults off-site or on failure', async () => {
  path = '/site/other/x'
  get.mockRejectedValue(new Error('404'))
  show()
  await waitFor(() => expect(get).toHaveBeenCalled())
  expect(screen.getByTestId('c')).toHaveTextContent('#6366f1')
  path = '/auth/login'
  show()
})
