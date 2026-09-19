import { render, screen } from '@testing-library/react'
import TopBarLinks from '@/components/layout/TopBarLinks'
import { isActive } from '@/components/layout/navTypes'
import {
  tenantSections,
  tenantModuleEntries,
  portalEntries,
  portalSections,
} from '@/components/layout/navConfig'

describe('nav config', () => {
  it('builds tenant sections with optional admin', () => {
    expect(tenantSections('d', false)).toHaveLength(1)
    const s = tenantSections('d', true)
    expect(s[1]?.items[0]?.href).toBe('/site/d/admin')
    expect(tenantModuleEntries('d')[0]?.href).toBe('/site/d/articles')
  })

  it('builds portal sections', () => {
    expect(portalEntries().length).toBeGreaterThan(2)
    expect(portalSections(false)).toHaveLength(1)
    expect(portalSections(true)[1]?.title).toBe('Platform')
  })

  it('matches active routes', () => {
    const e = { key: 'k', label: 'K', href: '/a#x', icon: null }
    expect(isActive('/a/b', e)).toBe(true)
    expect(isActive('/a/b', { ...e, exact: true })).toBe(false)
    expect(isActive('/a', { ...e, exact: true })).toBe(true)
  })
})

describe('TopBarLinks', () => {
  it('marks the active link', () => {
    render(
      <TopBarLinks
        items={tenantModuleEntries('demo')}
        pathname="/site/demo/forum"
      />,
    )
    expect(screen.getByTestId('nav-forum')).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByTestId('nav-tags')).not.toHaveAttribute('aria-current')
  })
})
