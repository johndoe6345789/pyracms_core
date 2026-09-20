import { fireEvent, render, screen } from '@testing-library/react'
import TopBarLinks from '@/components/layout/TopBarLinks'
import DrawerSection from '@/components/layout/DrawerSection'
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

  it('opens a dropdown from the top bar button', () => {
    render(
      <TopBarLinks
        items={tenantModuleEntries('demo')}
        pathname="/site/demo/games"
      />,
    )
    const btn = screen.getByTestId('nav-hypernucleus')
    expect(screen.queryByTestId('nav-hypernucleus-games')).toBeNull()
    fireEvent.click(btn)
    expect(screen.getByTestId('nav-hypernucleus-games')).toHaveAttribute(
      'href',
      '/site/demo/games',
    )
    expect(screen.getByTestId('nav-hypernucleus-dependencies')).toBeTruthy()
    expect(screen.getByTestId('nav-hypernucleus-download')).toHaveAttribute(
      'href',
      '/site/demo/download',
    )
  })

  it('expands as a group in the drawer', () => {
    const section = tenantSections('demo', false)[0]
    if (!section) throw new Error('no section')
    render(
      <DrawerSection
        section={section}
        index={0}
        pathname="/site/demo/forum"
        onClose={() => {}}
      />,
    )
    const group = screen.getByTestId('drawer-nav-hypernucleus')
    expect(group).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('drawer-nav-hypernucleus-games')).toBeTruthy()
    expect(screen.getByTestId('drawer-download')).toHaveAttribute(
      'href',
      '/site/demo/download',
    )
  })

  it('starts expanded on a Hypernucleus page', () => {
    const section = tenantSections('demo', false)[0]
    if (!section) throw new Error('no section')
    render(
      <DrawerSection
        section={section}
        index={0}
        pathname="/site/demo/dependencies"
        onClose={() => {}}
      />,
    )
    expect(screen.getByTestId('drawer-nav-hypernucleus')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
