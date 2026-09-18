import {
  detectOs, pickBinary, deepLink, installedStore, favouriteStore,
  initialOf, gradientFor,
} from '@/lib/launcher'

const bin = (os: string, arch: string, url = 'http://x/' + arch) =>
  ({ os, arch, url }) as never

describe('launcher helpers', () => {
  it('detects the OS from a user agent', () => {
    expect(detectOs('Windows NT 10')).toBe('Windows')
    expect(detectOs('Macintosh')).toBe('macOS')
    expect(detectOs('X11; Linux')).toBe('Linux')
    expect(detectOs('Android Linux')).toBe('Unknown')
    expect(detectOs('')).toBe('Unknown')
    expect(typeof detectOs()).toBe('string')
  })

  it('picks the 64-bit build for the OS', () => {
    const list = [bin('Windows', 'x86'), bin('windows', 'x64')]
    expect(pickBinary(list, 'Windows')?.arch).toBe('x64')
    expect(pickBinary(list, 'Linux')).toBeNull()
    expect(pickBinary([bin('linux', 'x64', '#')], 'Linux')).toBeNull()
  })

  it('builds deep links', () => {
    expect(deepLink('launch', 'a b', 'g')).toBe('pyracms://launch/a%20b/g')
  })

  it('stores installed marks', () => {
    localStorage.clear()
    installedStore.set('g', '1')
    expect(installedStore.get()).toEqual({ g: '1' })
    installedStore.remove('g')
    expect(installedStore.get()).toEqual({})
  })

  it('toggles favourites and survives bad storage', () => {
    localStorage.clear()
    expect(favouriteStore.toggle('g')).toEqual({ g: '1' })
    expect(favouriteStore.toggle('g')).toEqual({})
    localStorage.setItem('pyracms.launcher.favourites', '{bad')
    expect(favouriteStore.get()).toEqual({})
    const s = jest.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => { throw new Error('x') })
    expect(() => installedStore.set('a', '1')).not.toThrow()
    s.mockRestore()
  })

  it('makes art helpers', () => {
    expect(initialOf(' zed')).toBe('Z')
    expect(initialOf('')).toBe('?')
    expect(gradientFor('abc')).toContain('linear-gradient')
  })
})
