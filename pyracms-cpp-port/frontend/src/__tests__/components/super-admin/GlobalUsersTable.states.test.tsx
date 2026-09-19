/** Tests for GlobalUsersTable: loading, empty and layout. */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import GlobalUsersTable from '@/components/super-admin/GlobalUsersTable'
import { resetHook } from '../../helpers/globalUsersHook'

jest.mock('@/hooks/useSuperAdminUsers', () => ({
  useSuperAdminUsers: () =>
    jest.requireActual('../../helpers/globalUsersHook').mockHookState,
}))

describe('GlobalUsersTable', () => {
  beforeEach(() => resetHook())

  it('shows CircularProgress when loading is true', () => {
    resetHook({ loading: true })
    render(<GlobalUsersTable />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByTestId('global-users-table')).not.toBeInTheDocument()
  })

  it('shows "No users found." when users array is empty', () => {
    render(<GlobalUsersTable />)
    expect(screen.getByText('No users found.')).toBeInTheDocument()
  })

  it('table wrapper has data-testid="global-users-table"', () => {
    render(<GlobalUsersTable />)
    expect(screen.getByTestId('global-users-table')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<GlobalUsersTable />)
    for (const header of ['Username', 'Email', 'Role', 'Status', 'Joined']) {
      expect(screen.getByText(header)).toBeInTheDocument()
    }
  })
})
