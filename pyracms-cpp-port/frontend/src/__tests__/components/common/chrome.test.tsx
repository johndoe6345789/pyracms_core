import { render, screen } from '@testing-library/react'
import TenantBreadcrumbs from '@/components/common/TenantBreadcrumbs'

let path: string | null = '/site/s/articles/create'
let params: Record<string, string> = { slug: 's' }
jest.mock('next/navigation', () => ({
  useParams: () => params,
  usePathname: () => path,
}))

describe('TenantBreadcrumbs', () => {
  beforeEach(() => {
    path = '/site/s/articles/create'
    params = { slug: 's' }
  })

  it('builds crumbs with humanized labels', () => {
    render(<TenantBreadcrumbs />)
    expect(screen.getByTestId('breadcrumb-Home')).toHaveAttribute(
      'href',
      '/site/s',
    )
    expect(screen.getByTestId('breadcrumb-Articles')).toHaveAttribute(
      'href',
      '/site/s/articles',
    )
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('title-cases unknown segments', () => {
    path = '/site/s/my-page'
    render(<TenantBreadcrumbs />)
    expect(screen.getByText('My Page')).toBeInTheDocument()
  })

  it.each([
    ['no slug', '/site/s/x', {}],
    ['no pathname', null, { slug: 's' }],
    ['other prefix', '/other/x', { slug: 's' }],
    ['site root', '/site/s/', { slug: 's' }],
    ['only slashes', '/site/s//', { slug: 's' }],
  ])('renders nothing for %s', (_n, p, prm) => {
    path = p as string | null
    params = prm as Record<string, string>
    const { container } = render(<TenantBreadcrumbs />)
    expect(container).toBeEmptyDOMElement()
  })
})
