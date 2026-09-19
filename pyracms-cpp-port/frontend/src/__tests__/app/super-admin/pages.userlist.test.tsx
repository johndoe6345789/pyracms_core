import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock(
  '@/components/super-admin/GlobalUsersTable',
  () =>
    jest.requireActual('@/__tests__/helpers/superAdminPagesMocks')
      .usersTableMock,
)

import SuperAdminUsersPage from '@/app/super-admin/users/page'

describe('/super-admin/users page', () => {
  beforeEach(() => render(<SuperAdminUsersPage />))

  it('renders the page wrapper', () => {
    expect(screen.getByTestId('super-admin-users-page')).toBeInTheDocument()
  })

  it('renders the "Global Users" h1 heading', () => {
    expect(
      screen.getByRole('heading', {
        name: 'Global Users',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('renders the GlobalUsersTable', () => {
    expect(screen.getByTestId('mock-global-users-table')).toBeInTheDocument()
  })
})
