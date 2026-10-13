import { compactCount, formatDuration, formatViews } from '@/lib/videoFormat'

describe('formatDuration', () => {
  it('uses m:ss under an hour', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(75.9)).toBe('1:15')
    expect(formatDuration(3599)).toBe('59:59')
  })

  it('uses h:mm:ss from an hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3723)).toBe('1:02:03')
  })

  it('treats bad input as zero', () => {
    expect(formatDuration(-4)).toBe('0:00')
    expect(formatDuration(NaN)).toBe('0:00')
  })
})

describe('compactCount / formatViews', () => {
  it('abbreviates like YouTube', () => {
    expect(compactCount(950)).toBe('950')
    expect(compactCount(1000)).toBe('1K')
    expect(compactCount(1250)).toBe('1.2K')
    expect(compactCount(34_999)).toBe('34K')
    expect(compactCount(5_680_000)).toBe('5.6M')
    expect(compactCount(2_000_000_000)).toBe('2B')
    expect(compactCount(NaN)).toBe('0')
  })

  it('says view or views', () => {
    expect(formatViews(1)).toBe('1 view')
    expect(formatViews(0)).toBe('0 views')
    expect(formatViews(1200)).toBe('1.2K views')
  })
})
