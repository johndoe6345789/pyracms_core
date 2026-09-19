import { detectPlatform, refinePlatform, appleGpu } from '@/lib/platform'

const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120'
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605'
const LIN = 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120'

describe('detectPlatform', () => {
  it('reads the user agent', () => {
    expect(detectPlatform({ userAgent: WIN })).toEqual(
      { os: 'win', arch: 'x86_64' })
    expect(detectPlatform({ userAgent: LIN }).os).toBe('lin')
    expect(detectPlatform({ userAgent: MAC })).toEqual(
      { os: 'mac', arch: 'arm64' })
    expect(detectPlatform({ userAgent: 'X11; aarch64 Linux' }).arch)
      .toBe('arm64')
  })
  it('prefers client-hint platform and skips phones', () => {
    expect(detectPlatform({ userAgent: '', userAgentData: {
      platform: 'Windows' } }).os).toBe('win')
    expect(detectPlatform({ userAgent: 'Linux; Android 14' }).os).toBeNull()
    expect(detectPlatform({}).os).toBeNull()
  })
})

describe('refinePlatform', () => {
  const hints = (architecture: string) => ({ userAgentData: {
    getHighEntropyValues: async () => ({ architecture }) } })
  it('uses the architecture client hint', async () => {
    const w = { os: 'win', arch: 'x86_64' } as const
    expect((await refinePlatform(w, hints('arm'))).arch).toBe('arm64')
    expect((await refinePlatform({ ...w, arch: 'arm64' }, hints('x86')))
      .arch).toBe('x86_64')
  })
  it('ignores failing hints', async () => {
    const nav = { userAgentData: { getHighEntropyValues: async () => {
      throw new Error('denied') } } }
    const w = { os: 'lin', arch: 'x86_64' } as const
    expect(await refinePlatform(w, nav)).toEqual(w)
  })
  it('asks WebGL on macOS', async () => {
    const mac = { os: 'mac', arch: 'arm64' } as const
    const spy = jest.spyOn(document, 'createElement')
    const gl = (r: string) => ({
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 1 }),
      getParameter: () => r })
    spy.mockReturnValue({ getContext: () => gl('Intel Iris') } as never)
    expect((await refinePlatform(mac, {})).arch).toBe('x86_64')
    spy.mockReturnValue({ getContext: () => gl('Apple M2') } as never)
    expect(appleGpu()).toBe(true)
    spy.mockReturnValue({ getContext: () => null } as never)
    expect((await refinePlatform(mac, {})).arch).toBe('arm64')
    spy.mockImplementation(() => { throw new Error('x') })
    expect(appleGpu()).toBeNull()
    spy.mockRestore()
  })
})
