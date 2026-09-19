import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSelect from '@/components/common/LanguageSelect'

describe('ThemeToggle', () => {
  it('dispatches the chosen mode', () => {
    const { store } = makeStore()
    render(<Provider store={store}><ThemeToggle /></Provider>)
    fireEvent.click(screen.getByTestId('theme-toggle'))
    fireEvent.click(screen.getByTestId('theme-dark'))
    expect(store.getState().ui.colorMode).toBe('dark')
    expect(screen.getByTestId('theme-toggle'))
      .toHaveAttribute('aria-label', 'Toggle theme, current: Dark')
  })
})

const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

describe('LanguageSelect', () => {
  beforeEach(() => {
    refresh.mockReset()
    document.cookie = 'NEXT_LOCALE=; path=/; max-age=0'
  })

  it('sets the locale cookie and refreshes the server tree', () => {
    render(<LanguageSelect />)
    fireEvent.click(screen.getByTestId('language-select'))
    fireEvent.click(screen.getByTestId('lang-de'))
    expect(document.cookie).toContain('NEXT_LOCALE=de')
    expect(refresh).toHaveBeenCalled()
  })

  it('labels the active language using the translated word', () => {
    render(<LanguageSelect />)
    expect(screen.getByTestId('language-select'))
      .toHaveAttribute('aria-label', 'Language: English')
  })
})
