import {
  tenantModuleEntries,
  tenantSections,
} from '@/components/layout/navConfig'
import { isActive } from '@/components/layout/navTypes'

const labels = (slug: string) => tenantModuleEntries(slug).map((e) => e.label)

describe('Hypernucleus site menu', () => {
  it('replaces Games and Dependencies with one entry', () => {
    const l = labels('demo')
    expect(l).toContain('Hypernucleus')
    expect(l).not.toContain('Games')
    expect(l).not.toContain('Dependencies')
    expect(l.indexOf('Hypernucleus')).toBe(l.indexOf('Gallery') + 1)
  })

  it('links Games, Dependencies and the client download', () => {
    const h = tenantModuleEntries('demo').find((e) => e.key === 'hypernucleus')
    expect(h?.children?.map((c) => [c.label, c.href])).toEqual([
      ['Games', '/site/demo/games'],
      ['Dependencies', '/site/demo/dependencies'],
      ['Download Hypernucleus Client', '/site/demo/download'],
    ])
  })

  it('drops the separate launcher row from the site drawer', () => {
    const items = tenantSections('demo', false)[0]?.items ?? []
    expect(items.map((i) => i.label)).not.toContain('Get the launcher')
  })

  it('is active on any of its pages', () => {
    const h = tenantModuleEntries('demo').find((e) => e.key === 'hypernucleus')
    expect(h && isActive('/site/demo/games/5', h)).toBe(true)
    expect(h && isActive('/site/demo/forum', h)).toBe(false)
  })
})
