import { filterNavByFeatures } from '@/components/layout/navFeatures'
import {
  tenantModuleEntries,
  tenantSections,
} from '@/components/layout/navConfig'
import type { NavEntry } from '@/components/layout/navTypes'
import { ALL_ON, type FeatureFlags } from '@/lib/siteFeatures'

const off = (...ids: (keyof FeatureFlags)[]): FeatureFlags => {
  const f = { ...ALL_ON }
  ids.forEach((id) => (f[id] = false))
  return f
}
const keys = (flags: FeatureFlags | null) =>
  tenantModuleEntries('d', flags).map((e) => e.key)

describe('site menu features', () => {
  it('shows everything without flags or with all on', () => {
    expect(keys(null)).toEqual(keys(ALL_ON))
    expect(keys(null)).toEqual(
      expect.arrayContaining(['articles', 'forum', 'hypernucleus', 'tags']),
    )
  })

  it('hides an entry per switched-off feature', () => {
    const k = keys(off('forum', 'code_snippets'))
    expect(k).not.toContain('forum')
    expect(k).not.toContain('snippets')
    expect(k).toContain('articles')
    expect(k).toContain('tags')
  })

  it('drops Hypernucleus with all its children when off', () => {
    expect(keys(off('hypernucleus'))).not.toContain('hypernucleus')
  })

  it('keeps a group while a child feature is on, drops it when none', () => {
    const child = (key: string, feature: 'forum' | 'gallery'): NavEntry => ({
      key,
      label: key,
      href: `/${key}`,
      icon: null,
      feature,
    })
    const group: NavEntry = {
      key: 'g',
      label: 'G',
      href: '/g',
      icon: null,
      children: [child('a', 'forum'), child('b', 'gallery')],
    }
    const some = filterNavByFeatures([group], off('forum'))
    expect(some[0]?.children?.map((c) => c.key)).toEqual(['b'])
    expect(filterNavByFeatures([group], off('forum', 'gallery'))).toEqual([])
  })

  it('applies to the drawer sections too', () => {
    const items = tenantSections('d', false, off('gallery'))[0]?.items ?? []
    expect(items.map((i) => i.key)).not.toContain('gallery')
    expect(items.map((i) => i.key)).toContain('home')
  })

  it('keeps the download link while Hypernucleus is on', () => {
    const h = tenantModuleEntries('d', off('forum')).find(
      (e) => e.key === 'hypernucleus',
    )
    expect(h?.children?.map((c) => c.key)).toContain('hypernucleus-download')
  })
})
