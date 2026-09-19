import { m } from './scopeApi'

export const push = jest.fn()
export const replace = jest.fn()

/** Factory for `jest.mock('next/navigation', ...)`. */
export const navMock = {
  useParams: () => ({ slug: 's', name: 'n' }),
  useRouter: () => ({ push, replace }),
  usePathname: () => '/site/s',
}

/** Factory for `jest.mock('@/hooks/useTenantId', ...)`. */
export const tenantMock = {
  useTenantId: () => ({ tenantId: 1, loading: false }),
}

/** Factory for `jest.mock('@monaco-editor/react', ...)`. */
export const monacoMock = {
  __esModule: true,
  default: (p: { value: string; onChange: (v?: string) => void }) => (
    <textarea
      data-testid="monaco"
      value={p.value}
      onChange={(e) => p.onChange(e.target.value)}
    />
  ),
}

/** Routes `api.get` by URL substring; unmatched urls reject. */
export function routeGet(routes: Record<string, unknown>) {
  m.get.mockImplementation((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k))
    return key === undefined
      ? Promise.reject(new Error('no route'))
      : Promise.resolve({ data: routes[key] })
  })
}

/** recharts' ResponsiveContainer needs ResizeObserver in jsdom. */
export function stubResizeObserver() {
  ;(globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
