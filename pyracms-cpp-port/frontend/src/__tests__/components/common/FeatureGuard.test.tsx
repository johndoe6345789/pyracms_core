import { render, screen } from '@testing-library/react'
import FeatureGuard from '@/components/common/FeatureGuard'
import FeatureOff from '@/components/common/FeatureOff'
import { ALL_ON, type FeatureFlags } from '@/lib/siteFeatures'
import { useSiteFeatures } from '@/hooks/useSiteFeatures'

jest.mock('@/hooks/useSiteFeatures')

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))

const mockFlags = (flags: FeatureFlags | null) =>
  jest.mocked(useSiteFeatures).mockReturnValue({
    flags,
    loading: flags === null,
    isOn: (id) => !flags || !id || flags[id],
  })

afterEach(() => jest.resetAllMocks())

const ui = (
  <FeatureGuard feature="forum" name="Forum">
    <p>the forum</p>
  </FeatureGuard>
)

describe('FeatureGuard', () => {
  it('renders nothing while loading', () => {
    mockFlags(null)
    const { container } = render(ui)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders children when the feature is on', () => {
    mockFlags(ALL_ON)
    render(ui)
    expect(screen.getByText('the forum')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-off')).toBeNull()
  })

  it('shows the friendly off state when the feature is off', () => {
    mockFlags({ ...ALL_ON, forum: false })
    render(ui)
    expect(screen.queryByText('the forum')).toBeNull()
    expect(
      screen.getByText('This feature is turned off for this site'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Forum is not available/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/site/demo')
  })
})

describe('FeatureOff', () => {
  it('works without a feature name', () => {
    render(<FeatureOff slug="x" />)
    expect(screen.getByText(/It is not available/)).toBeInTheDocument()
  })
})
