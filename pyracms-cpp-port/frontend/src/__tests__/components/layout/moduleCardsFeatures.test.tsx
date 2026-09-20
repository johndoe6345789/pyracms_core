import { render, screen } from '@testing-library/react'
import TenantModuleCards from '@/components/layout/TenantModuleCards'
import { ALL_ON, type FeatureFlags } from '@/lib/siteFeatures'
import { useSiteFeatures } from '@/hooks/useSiteFeatures'

jest.mock('@/hooks/useSiteFeatures')

const off = (...ids: (keyof FeatureFlags)[]): FeatureFlags => {
  const f = { ...ALL_ON }
  ids.forEach((id) => (f[id] = false))
  return f
}

describe('home module cards', () => {
  const mockFlags = (flags: FeatureFlags | null) =>
    jest.mocked(useSiteFeatures).mockReturnValue({
      flags,
      loading: flags === null,
      isOn: (id) => !flags || !id || flags[id],
    })

  afterEach(() => jest.resetAllMocks())

  it('hides cards of switched-off features', () => {
    mockFlags(off('forum', 'hypernucleus'))
    render(<TenantModuleCards slug="d" />)
    expect(screen.queryByText('Forum')).toBeNull()
    expect(screen.queryByText('Games')).toBeNull()
    expect(screen.queryByText('Dependencies')).toBeNull()
    expect(screen.getByText('Articles')).toBeInTheDocument()
    expect(screen.getByText('Tags')).toBeInTheDocument()
  })

  it('shows all cards while loading', () => {
    mockFlags(null)
    render(<TenantModuleCards slug="d" canAdmin />)
    expect(screen.getByText('Forum')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })
})
