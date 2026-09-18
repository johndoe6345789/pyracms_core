import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'
import SuperAdminAppBar
  from '@/components/super-admin/SuperAdminAppBar'

export const navigationMock = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ slug: 'demo' }),
  usePathname: () => '/super-admin',
}

export function renderAppBar(
  isMobile: boolean,
  onMenuClick: jest.Mock,
) {
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  })
  return render(
    <Provider store={store}>
      <SuperAdminAppBar
        isMobile={isMobile}
        onMenuClick={onMenuClick}
      />
    </Provider>,
  )
}
