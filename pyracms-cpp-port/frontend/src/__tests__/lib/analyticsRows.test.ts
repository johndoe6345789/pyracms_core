import {
  dateLabel,
  mapPageViews,
  mapReferrers,
  mapSearches,
} from '@/lib/analyticsRows'

describe('dateLabel', () => {
  it('formats a database timestamp for each period', () => {
    const raw = '2026-09-20 00:00:00+01'
    expect(dateLabel(raw, 'day')).toBe('Sep 20')
    expect(dateLabel(raw, 'week')).toBe('Week of Sep 20')
    expect(dateLabel(raw, 'month')).toBe('Sep 2026')
  })

  it('keeps text it cannot read', () => {
    expect(dateLabel('soon', 'day')).toBe('soon')
    expect(dateLabel(undefined, 'day')).toBe('')
  })
})

describe('mapPageViews', () => {
  it('turns count into views under a readable date', () => {
    expect(mapPageViews([{ date: '2026-01-05', count: '7' }], 'day')).toEqual([
      { date: 'Jan 5', views: 7 },
    ])
  })
})

describe('mapReferrers', () => {
  it('works out each share of the visits and calls no referrer Direct', () => {
    const out = mapReferrers([
      { referrer: 'https://a.io', count: 3 },
      { referrer: '', count: 1 },
    ])
    expect(out).toEqual([
      { source: 'https://a.io', visits: 3, percentage: 75 },
      { source: 'Direct', visits: 1, percentage: 25 },
    ])
  })

  it('rounds to one decimal and copes with no data', () => {
    const [a] = mapReferrers([
      { referrer: 'x', count: 1 },
      { referrer: 'y', count: 2 },
    ])
    expect(a?.percentage).toBe(33.3)
    expect(mapReferrers([])).toEqual([])
    expect(mapReferrers([{ referrer: 'x', count: 0 }])[0]?.percentage).toBe(0)
  })
})

describe('mapSearches', () => {
  it('keeps queries with their counts and drops blanks', () => {
    expect(
      mapSearches([
        { query: 'react', count: 4 },
        { query: '', count: 9 },
        { count: 2 },
      ]),
    ).toEqual([{ query: 'react', count: 4 }])
  })
})
