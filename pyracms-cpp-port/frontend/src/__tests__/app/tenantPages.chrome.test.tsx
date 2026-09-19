import { screen } from '@testing-library/react'
import { renderWithStore } from '../helpers/renderWithStore'
import LoginPage from '@/app/auth/login/page'
import RegisterPage from '@/app/auth/register/page'
import TenantLayout from '@/app/site/[slug]/(tenant)/layout'
import SiteHomePage from '@/app/site/[slug]/(tenant)/page'
import { st } from '../helpers/tenantPagesMocks'

jest.mock('next/navigation', () =>
  require('../helpers/tenantPagesMocks').navMock(),
)
jest.mock('@/lib/api', () => require('../helpers/tenantPagesMocks').apiMock())
jest.mock('@/components/common/TenantBreadcrumbs', () =>
  require('../helpers/tenantPagesMocks').crumbsMock(),
)
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/useTenant', () =>
  require('../helpers/tenantPagesMocks').tenantMock(),
)

describe('auth pages', () => {
  it('render the forms', () => {
    const a = renderWithStore(<LoginPage />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    a.unmount()
    renderWithStore(<RegisterPage />)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })
})

describe('tenant pages', () => {
  beforeEach(() => {
    st.notFound = false
    st.push.mockClear()
  })

  it('layout wraps children with chrome', () => {
    renderWithStore(
      <TenantLayout>
        <p>kid</p>
      </TenantLayout>,
    )
    expect(screen.getByText('kid')).toBeInTheDocument()
    expect(screen.getByTestId('crumbs')).toBeInTheDocument()
    expect(screen.getByTestId('skip-to-content')).toBeInTheDocument()
  })

  it('home shows the welcome text and module cards', () => {
    renderWithStore(<SiteHomePage />)
    expect(screen.getByText(/Welcome to Demo/)).toBeInTheDocument()
    expect(screen.getByTestId('module-cards')).toBeInTheDocument()
  })

  it('home shows not found', () => {
    st.notFound = true
    renderWithStore(<SiteHomePage />)
    expect(screen.getByText(/no site called/)).toBeInTheDocument()
  })
})
