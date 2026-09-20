import { fireEvent, render, screen } from '@testing-library/react'
import TopBarLinks from '@/components/layout/TopBarLinks'
import DrawerSection from '@/components/layout/DrawerSection'
import {
  tenantModuleEntries,
  tenantSections,
} from '@/components/layout/navConfig'

describe('Hypernucleus menu rendering', () => {
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
