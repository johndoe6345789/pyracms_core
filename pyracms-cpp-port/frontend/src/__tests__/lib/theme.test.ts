import { lightTheme, darkTheme } from '@/lib/theme'

describe('themes', () => {
  it('exposes light and dark palettes', () => {
    expect(lightTheme.palette.mode).toBe('light')
    expect(darkTheme.palette.mode).toBe('dark')
    expect(lightTheme.palette.primary.main).toBe('#6366f1')
    expect(darkTheme.palette.background.default).toBe('#0f172a')
  })
})
