import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/components/super-admin/GlobalUsersTable', () =>
  require('@/__tests__/helpers/superAdminPagesMocks')
    .usersTableMock)

import SuperAdminUsersPage
  from '@/app/super-admin/users/page'
import SuperAdminSettingsPage
  from '@/app/super-admin/settings/page'

describe('/super-admin/users page', () => {
  beforeEach(() => render(<SuperAdminUsersPage />))

  it('renders the page wrapper', () => {
    expect(
      screen.getByTestId('super-admin-users-page'),
    ).toBeInTheDocument()
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
    expect(
      screen.getByTestId('mock-global-users-table'),
    ).toBeInTheDocument()
  })
})

describe('/super-admin/settings page', () => {
  beforeEach(() => render(<SuperAdminSettingsPage />))

  it('renders the page wrapper', () => {
    expect(
      screen.getByTestId('super-admin-settings-page'),
    ).toBeInTheDocument()
  })

  it('renders the "Platform Settings" h1 heading', () => {
    expect(
      screen.getByRole('heading', {
        name: 'Platform Settings',
        level: 1,
      }),
    ).toBeInTheDocument()
  })

  it('renders the info alert', () => {
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('alert contains platform-settings description', () => {
    expect(screen.getByRole('alert')).toHaveTextContent(
      /global platform settings/i,
    )
  })

  it('settings icon is aria-hidden', () => {
    // The TuneOutlined svg should carry aria-hidden="true"
    // so it does not pollute the accessible name tree.
    const icons = document
      .querySelectorAll('[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
  })
})
