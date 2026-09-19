/** Tests for GlobalUsersTable: status chips and role cell. */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import GlobalUsersTable from '@/components/super-admin/GlobalUsersTable'
import { USER_ALICE, USER_BOB, resetHook } from '../../helpers/globalUsersHook'

jest.mock('@/hooks/useSuperAdminUsers', () => ({
  useSuperAdminUsers: () =>
    jest.requireActual('../../helpers/globalUsersHook').mockHookState,
}))

describe('GlobalUsersTable', () => {
  beforeEach(() => resetHook())

  it('active user has "Active" chip', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('inactive user has "Banned" chip', () => {
    resetHook({ users: [USER_BOB] })
    render(<GlobalUsersTable />)
    expect(screen.getByText('Banned')).toBeInTheDocument()
  })

  it('renders the role select cell for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId(`role-select-${USER_ALICE.username}`),
    ).toBeInTheDocument()
  })
})
