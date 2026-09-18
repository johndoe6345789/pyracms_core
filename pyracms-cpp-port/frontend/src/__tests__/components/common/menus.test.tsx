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

describe('LanguageSelect', () => {
  beforeEach(() => localStorage.clear())

  it('uses the stored locale and persists a change', () => {
    localStorage.setItem('locale', 'fr')
    render(<LanguageSelect />)
    expect(screen.getByTestId('language-select').getAttribute(
      'aria-label')).toContain('current:')
    fireEvent.click(screen.getByTestId('language-select'))
    fireEvent.click(screen.getByTestId('lang-de'))
    expect(localStorage.getItem('locale')).toBe('de')
  })

  it('falls back to English', () => {
    render(<LanguageSelect />)
    expect(screen.getByTestId('language-select').getAttribute(
      'aria-label')).toContain('English')
  })
})
