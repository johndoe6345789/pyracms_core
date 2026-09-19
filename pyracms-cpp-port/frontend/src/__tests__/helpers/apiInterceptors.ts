import api from '@/lib/api'

type Handlers = {
  fulfilled: (v: never) => unknown
  rejected: (e: unknown) => unknown
}

const first = (x: unknown) => (x as { handlers: Handlers[] }).handlers[0]!

export const req = () => first(api.interceptors.request)
export const res = () => first(api.interceptors.response)

export const nav = { assigned: '' }

export const setLocation = (pathname: string) =>
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname,
      set href(v: string) {
        nav.assigned = v
      },
    },
  })

/** Register hooks that stub window.location for a test file. */
export const installFakeLocation = () => {
  const real = window.location
  beforeEach(() => {
    localStorage.clear()
    nav.assigned = ''
    setLocation('/site/demo/forum')
  })
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: real,
    })
  })
}
