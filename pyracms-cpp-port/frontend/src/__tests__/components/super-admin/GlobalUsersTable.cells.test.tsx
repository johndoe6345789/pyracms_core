import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GlobalUsersTable from
  '@/components/super-admin/GlobalUsersTable'
import {
  USER_ALICE, USER_BOB, resetHook,
} from '@/__tests__/helpers/globalUsersTableHelpers'

jest.mock('@/hooks/useSuperAdminUsers', () => ({
  useSuperAdminUsers: () =>
    require('@/__tests__/helpers/globalUsersTableHelpers')
      .mockHookState,
}))

describe('GlobalUsersTable', () => {
  beforeEach(() => resetHook())

  it('renders createdAt date for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByText(USER_ALICE.createdAt),
    ).toBeInTheDocument()
  })

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

  it('table wrapper has data-testid="global-users-table"', () => {
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId('global-users-table'),
    ).toBeInTheDocument()
  })

  it('renders the role select cell for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId(`role-select-${USER_ALICE.username}`),
    ).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<GlobalUsersTable />)
    for (const header of [
      'Username', 'Email', 'Role', 'Status', 'Joined',
    ]) {
      expect(screen.getByText(header)).toBeInTheDocument()
    }
  })
})
