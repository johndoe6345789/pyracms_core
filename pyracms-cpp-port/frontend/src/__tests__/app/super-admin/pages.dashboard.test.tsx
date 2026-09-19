import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/super-admin/SuperAdminDashboard', () =>
  require('@/__tests__/helpers/superAdminPagesMocks')
    .dashboardMock)

import SuperAdminPage
  from '@/app/super-admin/page'

describe('/super-admin page', () => {
  it('renders the SuperAdminDashboard component', () => {
    render(<SuperAdminPage />)
    expect(
      screen.getByTestId('mock-super-admin-dashboard'),
    ).toBeInTheDocument()
  })

  it('shows "Platform Overview" heading via dashboard', () => {
    render(<SuperAdminPage />)
    expect(
      screen.getByRole('heading', { name: /platform overview/i }),
    ).toBeInTheDocument()
  })
})
