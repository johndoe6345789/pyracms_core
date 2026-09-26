import { render, screen, fireEvent } from '@testing-library/react'
import StylePresets from '@/components/admin/styles/StylePresets'
import { THEME_PRESETS, sameTheme } from '@/components/admin/styles/presets'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'
import { FONTS } from '@/components/admin/styles/themeConfig'

const other = { ...DEFAULT_THEME, primaryColor: '#123456' }

it('offers a dozen well-formed presets with distinct names', () => {
  expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(12)
  expect(new Set(THEME_PRESETS.map((p) => p.name)).size).toBe(
    THEME_PRESETS.length,
  )
  for (const p of THEME_PRESETS) {
    expect(p.theme.primaryColor).toMatch(/^#[0-9a-f]{6}$/i)
    expect(p.theme.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i)
    expect(FONTS).toContain(p.theme.fontFamily)
  }
  expect(sameTheme(DEFAULT_THEME, { ...DEFAULT_THEME })).toBe(true)
  expect(sameTheme(DEFAULT_THEME, other)).toBe(false)
})

it('previews a preset and offers the way back to the saved style', () => {
  const onPick = jest.fn()
  const first = THEME_PRESETS[0]!
  render(
    <StylePresets
      theme={first.theme}
      saved={DEFAULT_THEME}
      previous={null}
      unsaved={false}
      onPick={onPick}
    />,
  )
  expect(screen.getByTestId('style-unsaved')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Go back to this'))
  expect(onPick).toHaveBeenLastCalledWith(DEFAULT_THEME)
  fireEvent.click(screen.getByLabelText('Use Sunset Boulevard'))
  expect(onPick).toHaveBeenLastCalledWith(
    THEME_PRESETS.find((p) => p.name === 'Sunset Boulevard')!.theme,
  )
})

it('shows no warning when unchanged; the previous style if any', () => {
  const { rerender } = render(
    <StylePresets
      theme={DEFAULT_THEME}
      saved={DEFAULT_THEME}
      previous={null}
      unsaved={false}
      onPick={jest.fn()}
    />,
  )
  expect(screen.queryByTestId('style-unsaved')).toBeNull()
  expect(screen.queryByText('Your previous style')).toBeNull()
  rerender(
    <StylePresets
      theme={DEFAULT_THEME}
      saved={DEFAULT_THEME}
      previous={other}
      unsaved={false}
      onPick={jest.fn()}
    />,
  )
  expect(screen.getByText('Your previous style')).toBeInTheDocument()
})
