import { fitCount } from '@/lib/fitCount'

describe('fitCount', () => {
  const w = [100, 100, 100, 100]

  it('keeps everything when the whole row fits, with no room for More', () => {
    expect(fitCount(w, 400, 96)).toBe(4)
    expect(fitCount(w, 500, 96)).toBe(4)
  })

  it('reserves room for More once something must go', () => {
    expect(fitCount(w, 399, 96)).toBe(3) // 300 <= 303
    expect(fitCount(w, 350, 96)).toBe(2) // 200 <= 254
    expect(fitCount(w, 200, 96)).toBe(1) // 100 <= 104
  })

  it('shows only More when nothing else fits', () => {
    expect(fitCount(w, 150, 96)).toBe(0)
    expect(fitCount(w, 0, 96)).toBe(0)
  })

  it('copes with links of different lengths and no links', () => {
    expect(fitCount([60, 200, 60], 300, 96)).toBe(1)
    expect(fitCount([], 300, 96)).toBe(0)
  })
})
