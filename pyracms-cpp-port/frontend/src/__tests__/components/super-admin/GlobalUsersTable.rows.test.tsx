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

  it('shows CircularProgress when loading is true', () => {
    resetHook({ loading: true })
    render(<GlobalUsersTable />)
    expect(
      screen.getByRole('progressbar'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('global-users-table'),
    ).not.toBeInTheDocument()
  })

  it('shows "No users found." when users array is empty', () => {
    render(<GlobalUsersTable />)
    expect(
      screen.getByText('No users found.'),
    ).toBeInTheDocument()
  })

  it('renders one table row per user', () => {
    resetHook({ users: [USER_ALICE, USER_BOB] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId('user-row-alice'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('user-row-bob'),
    ).toBeInTheDocument()
  })

  it('each row has data-testid="user-row-{username}"', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByTestId(`user-row-${USER_ALICE.username}`),
    ).toBeInTheDocument()
  })

  it('row data-testid is a <tr> element', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    const row = screen.getByTestId('user-row-alice')
    expect(row.tagName.toLowerCase()).toBe('tr')
  })

  it('renders username and email for each user', () => {
    resetHook({ users: [USER_ALICE] })
    render(<GlobalUsersTable />)
    expect(
      screen.getByText(USER_ALICE.username),
    ).toBeInTheDocument()
    expect(
      screen.getByText(USER_ALICE.email),
    ).toBeInTheDocument()
  })
})
