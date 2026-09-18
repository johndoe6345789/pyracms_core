import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderCrumbs } from '@/__tests__/helpers/superAdminCrumbs'

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }))

const current = () => screen.getByTestId('breadcrumb-current')
const saLink = () => screen.getByTestId('breadcrumb-link-super-admin')
const tLink = () => screen.getByTestId('breadcrumb-link-tenants')

describe('SuperAdminBreadcrumbs depth', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('one level deep (/super-admin/tenants)', () => {
    it('renders "Super Admin" as a link', () => {
      renderCrumbs('/super-admin/tenants')
      expect(saLink()).toBeInTheDocument()
    })

    it('"Super Admin" link href is /super-admin', () => {
      renderCrumbs('/super-admin/tenants')
      expect(saLink()).toHaveAttribute('href', '/super-admin')
    })

    it('renders "Tenants" as the current page crumb', () => {
      renderCrumbs('/super-admin/tenants')
      expect(current()).toHaveTextContent('Tenants')
    })

    it('"Tenants" crumb has aria-current="page"', () => {
      renderCrumbs('/super-admin/tenants')
      expect(current()).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('two levels deep (/super-admin/tenants/42)', () => {
    it('renders "Super Admin" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(saLink()).toBeInTheDocument()
    })

    it('renders "Tenants" link', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(tLink()).toBeInTheDocument()
    })

    it('"Tenants" link href is /super-admin/tenants', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(tLink()).toHaveAttribute('href', '/super-admin/tenants')
    })

    it('renders "42" as the current page crumb', () => {
      renderCrumbs('/super-admin/tenants/42')
      expect(current()).toHaveTextContent('42')
    })
  })

  describe('ShieldOutlined icon', () => {
    it('icon appears when Super Admin is a link crumb', () => {
      renderCrumbs('/super-admin/tenants')
      // The shield svg is aria-hidden inside the link crumb.
      const icon = saLink().querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('no extra icon on non-root link crumbs', () => {
      renderCrumbs('/super-admin/tenants/42')
      // Tenants link should not contain an aria-hidden icon.
      const icon = tLink().querySelector('[aria-hidden="true"]')
      expect(icon).not.toBeInTheDocument()
    })
  })
})
