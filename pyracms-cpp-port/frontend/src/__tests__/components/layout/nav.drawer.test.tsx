import { render, screen, fireEvent } from '@testing-library/react'
import AppDrawer from '@/components/layout/AppDrawer'
import { tenantSections, TENANT_FOOTER } from '@/components/layout/navConfig'

const path = '/site/demo/forum'
jest.mock('next/navigation', () => ({ usePathname: () => path }))

describe('AppDrawer', () => {
  const onClose = jest.fn()
  const render1 = (footer?: boolean) =>
    render(
      <AppDrawer
        open
        onClose={onClose}
        title="T"
        subtitle="Sub"
        sections={tenantSections('demo', true)}
        {...(footer ? { footer: TENANT_FOOTER } : {})}
      />,
    )

  it('renders header, active item and footer', () => {
    render1(true)
    expect(screen.getByText('Sub')).toBeInTheDocument()
    expect(screen.getByTestId('drawer-nav-forum')).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByTestId('drawer-admin')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('drawer-portal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('omits footer and closes from the header', () => {
    render1(false)
    expect(screen.queryByTestId('drawer-portal')).toBeNull()
    fireEvent.click(screen.getByLabelText('Close navigation menu'))
    expect(onClose).toHaveBeenCalled()
  })
})
