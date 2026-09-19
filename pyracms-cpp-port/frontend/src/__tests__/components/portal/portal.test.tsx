import { render, screen } from '@testing-library/react'
import TenantCard from '@/components/portal/TenantCard'
import TenantGrid from '@/components/portal/TenantGrid'
import HeroSection from '@/components/portal/HeroSection'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('react-redux', () => ({
  useSelector: () => ({ isAuthenticated: false }),
}))

const site = { slug: 'demo', name: 'Demo', description: 'D', owner: 'bob' }

describe('portal components', () => {
  it('renders a tenant card link', () => {
    render(<TenantCard site={site as never} />)
    expect(screen.getByText('Demo').closest('a')).toHaveAttribute(
      'href',
      '/site/demo',
    )
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('renders skeletons while loading', () => {
    const { container } = render(<TenantGrid sites={[]} loading />)
    expect(
      container.querySelectorAll('.MuiSkeleton-root').length,
    ).toBeGreaterThan(5)
  })

  it('renders site cards when loaded', () => {
    render(
      <TenantGrid
        loading={false}
        sites={[site, { ...site, slug: 'b', name: 'Bee' }] as never}
      />,
    )
    expect(screen.getByText('Bee')).toBeInTheDocument()
  })

  it('renders the hero', () => {
    render(<HeroSection />)
    expect(screen.getByText('Welcome to PyraCMS')).toBeInTheDocument()
  })
})
