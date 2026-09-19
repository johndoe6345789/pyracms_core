import { render, screen, fireEvent } from '@testing-library/react'
import SkipLink from '@/components/layout/SkipLink'
import SiteNotFound from '@/components/layout/SiteNotFound'
import TenantModuleCards from '@/components/layout/TenantModuleCards'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useParams: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
}))

describe('SkipLink', () => {
  it('reveals on focus and hides on blur', () => {
    render(<SkipLink />)
    const a = screen.getByTestId('skip-to-content')
    fireEvent.focus(a)
    expect(a.style.position).toBe('fixed')
    fireEvent.blur(a)
    expect(a.style.position).toBe('absolute')
  })
})

describe('SiteNotFound', () => {
  it('names the missing site', () => {
    render(<SiteNotFound slug="ghost" />)
    expect(screen.getByText('ghost')).toBeInTheDocument()
    expect(screen.getByText('Portal')).toHaveAttribute('href', '/')
  })
})

describe('TenantModuleCards', () => {
  it('shows admin card only for admins', () => {
    const { rerender } = render(<TenantModuleCards slug="d" />)
    expect(screen.getByTestId('module-games')).toHaveAttribute(
      'href',
      '/site/d/games',
    )
    expect(screen.queryByTestId('module-admin')).toBeNull()
    rerender(<TenantModuleCards slug="d" canAdmin />)
    expect(screen.getByTestId('module-admin')).toBeInTheDocument()
  })
})
