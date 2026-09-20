import { dayOf } from '@/lib/dates'
import { mapFileRecord } from '@/hooks/admin/fileData'
import { mapSummary } from '@/hooks/useArticles'

describe('dayOf', () => {
  it.each([
    ['2026-09-20 20:52:32.94389+01', '2026-09-20'], // as the API sends some
    ['2026-09-18T23:24:21.498915Z', '2026-09-18'], // ...and others
    ['2026-01-05', '2026-01-05'],
  ])('%s -> %s', (raw, day) => {
    expect(dayOf(raw)).toBe(day)
  })

  it.each([undefined, null, 5, '', 'yesterday', {}])(
    'gives nothing for %p',
    (v) => {
      expect(dayOf(v)).toBe('')
    },
  )
})

describe('mappers use it', () => {
  it('shows only the day for an uploaded file', () => {
    const f = mapFileRecord({ id: 1, createdAt: '2026-09-20 20:52:32+01' })
    expect(f.uploadedAt).toBe('2026-09-20')
  })

  it('shows only the day for an article', () => {
    const a = mapSummary({ name: 'a', createdAt: '2026-09-20 20:52:32+01' })
    expect(a.date).toBe('2026-09-20')
  })
})
