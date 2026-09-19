export const revs = [{ version: '2', published: true, date: 'x' }]
export const bins = [
  { os: 'windows', arch: 'x64', size: '1', url: 'http://d/x' },
]

export const base = {
  slug: 's',
  name: 'n',
  revisions: revs,
  binaries: [],
  installedVersion: undefined,
  onInstalled: jest.fn(),
  onUninstall: jest.fn(),
}

export const hrefs = { list: [] as string[] }

/** Stubs window.location.href and fake timers for one test file. */
export const stubGameActionsEnv = () => {
  const realLocation = window.location
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        set href(v: string) {
          hrefs.list.push(v)
        },
        get href() {
          return ''
        },
      },
    })
  })
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: realLocation,
    })
  })
  beforeEach(() => {
    hrefs.list = []
    jest.useFakeTimers()
  })
  afterEach(() => jest.useRealTimers())
}
