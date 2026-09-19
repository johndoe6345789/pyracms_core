import { formatDay, formatDateTime, parseApiDate } from '@/hooks/articleDate'
import api from '@/lib/api'

const push = jest.fn()

let qs = 'q=hello&site=demo'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(qs),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 7 }),
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

const get = api.get as jest.Mock

beforeEach(() => {
  get.mockReset()
  push.mockReset()
  qs = 'q=hello&site=demo'
})

describe('article dates', () => {
  it('parses API timestamps', () => {
    expect(parseApiDate('2024-03-05 10:20:30+00').toISOString()).toBe(
      '2024-03-05T10:20:30.000Z',
    )
  })

  it('formats days and date-times', () => {
    expect(formatDay('')).toBe('')
    expect(formatDay('2024-03-05 10:20:30+00')).toContain('2024')
    expect(formatDateTime('2024-03-05 10:20:30+00')).toContain('2024')
  })
})
