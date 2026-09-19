import { render, screen, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ThemeWrapper from '@/components/common/ThemeWrapper'
import authReducer from '@/store/slices/authSlice'
import uiReducer, { setColorMode, type ColorMode }
  from '@/store/slices/uiSlice'

jest.mock('@/hooks/useAuthHydration', () => ({
  useAuthHydration: jest.fn(),
}))

let listener: ((e: { matches: boolean }) => void) | null = null
const mq = (matches: boolean) => ({
  matches,
  addEventListener: (_: string, l: typeof listener) => { listener = l },
  removeEventListener: jest.fn(),
})

function show(colorMode: ColorMode, dark: boolean) {
  window.matchMedia = jest.fn().mockReturnValue(mq(dark))
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  })
  store.dispatch(setColorMode(colorMode))
  return render(<Provider store={store}>
    <ThemeWrapper><p>kid</p></ThemeWrapper></Provider>)
}

describe('ThemeWrapper', () => {
  it.each<[ColorMode, boolean]>([
    ['light', true], ['dark', false], ['system', true], ['system', false],
  ])('renders children in %s mode (system dark=%s)', (mode, dark) => {
    show(mode, dark)
    expect(screen.getByText('kid')).toBeInTheDocument()
  })

  it('follows system changes and unsubscribes', () => {
    const { unmount } = show('system', false)
    act(() => listener!({ matches: true }))
    expect(screen.getByText('kid')).toBeInTheDocument()
    unmount()
  })
})
