import { pickTopGroup } from '@/hooks/useSiteMenu'

describe('pickTopGroup', () => {
  const g = (name: string, n: number) => ({ name, items: Array(n).fill(0) })
  it('prefers the group called main', () => {
    expect(pickTopGroup([g('footer', 2), g(' Main ', 1)])?.name).toBe(' Main ')
  })
  it('otherwise takes the first group with links', () => {
    expect(pickTopGroup([g('empty', 0), g('nav', 3)])?.name).toBe('nav')
  })
  it('is undefined when there is nothing to show', () => {
    expect(pickTopGroup([g('empty', 0)])).toBeUndefined()
    expect(pickTopGroup([])).toBeUndefined()
  })
})
