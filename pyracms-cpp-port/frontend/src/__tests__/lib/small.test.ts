import { apiErrorMessage } from '@/lib/apiError'
import { formatForumDate } from '@/lib/forumDate'
import { initialOf, gradientFor } from '@/lib/launcherArt'
import { installedStore, favouriteStore } from '@/lib/launcherStore'
import { parseTurbologin } from '@/lib/turbologin'

describe('apiErrorMessage', () => {
  it('uses the server error, then the fallback', () => {
    expect(
      apiErrorMessage({ response: { data: { error: 'nope' } } }, 'fb'),
    ).toBe('nope')
    expect(apiErrorMessage({ response: {} }, 'fb')).toBe('fb')
  })
  it('reports connectivity problems', () => {
    expect(apiErrorMessage(new Error('x'), 'fb')).toBe(
      'Unable to connect to server',
    )
    expect(apiErrorMessage(null, 'fb')).toBe('Unable to connect to server')
  })
})

describe('formatForumDate', () => {
  it('formats and handles empty', () => {
    expect(formatForumDate('2024-01-02T03:04:05Z')).toBe('2024-01-02 03:04')
    expect(formatForumDate(null)).toBe('')
    expect(formatForumDate()).toBe('')
  })
})

describe('launcherArt', () => {
  it('derives initials and gradients', () => {
    expect(initialOf('  zed')).toBe('Z')
    expect(initialOf('')).toBe('?')
    expect(gradientFor('abc')).toBe(gradientFor('abc'))
    expect(gradientFor('abc')).toMatch(/^linear-gradient\(135deg, hsl/)
  })
})

describe('launcherStore', () => {
  beforeEach(() => localStorage.clear())
  it('tracks installed games', () => {
    installedStore.set('a', '1')
    installedStore.set('b', '2')
    installedStore.remove('a')
    expect(installedStore.get()).toEqual({ b: '2' })
  })
  it('toggles favourites', () => {
    expect(favouriteStore.toggle('a')).toEqual({ a: '1' })
    expect(favouriteStore.toggle('a')).toEqual({})
    expect(favouriteStore.get()).toEqual({})
  })
  it('survives corrupt or unavailable storage', () => {
    localStorage.setItem('pyracms.launcher.installed', '{bad')
    expect(installedStore.get()).toEqual({})
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('full')
      })
    expect(() => installedStore.set('a', '1')).not.toThrow()
    spy.mockRestore()
  })
})

describe('parseTurbologin', () => {
  it('rejects empty, invalid and incomplete input', () => {
    expect(parseTurbologin('  ')).toMatchObject({ ok: false })
    expect(parseTurbologin('{x')).toMatchObject({ ok: false })
    expect(parseTurbologin('{"user":"u"}')).toMatchObject({ ok: false })
  })
  it('accepts a valid login', () => {
    expect(parseTurbologin('{"user":"u","pass":"p"}')).toEqual({
      ok: true,
      user: 'u',
      pass: 'p',
    })
  })
})
