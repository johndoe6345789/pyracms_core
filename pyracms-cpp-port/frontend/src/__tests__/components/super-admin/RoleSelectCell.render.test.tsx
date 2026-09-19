/** Tests for RoleSelectCell: rendered value and attributes. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { UserRole, USER_ROLE_LABELS } from '@/types'
import { renderCell } from '../../helpers/roleSelectCell'

describe('RoleSelectCell', () => {
  it('renders a Select with the current role value', () => {
    renderCell({ role: UserRole.Moderator })
    // MUI Select displays the selected label as visible text
    expect(
      screen.getByText(USER_ROLE_LABELS[UserRole.Moderator]),
    ).toBeInTheDocument()
  })

  it('data-testid includes the username', () => {
    renderCell({ username: 'carol' })
    expect(
      screen.getByTestId('role-select-carol'),
    ).toBeInTheDocument()
  })

  it('aria-label includes the username', () => {
    renderCell({ username: 'dave' })
    const input = screen.getByRole('combobox', {
      hidden: true,
    })
    expect(input).toHaveAttribute(
      'aria-label',
      'Role for dave',
    )
  })

  it('shows Guest label when role is Guest', () => {
    renderCell({ role: UserRole.Guest })
    expect(
      screen.getByText(USER_ROLE_LABELS[UserRole.Guest]),
    ).toBeInTheDocument()
  })

  it('shows SuperAdmin label when role is SuperAdmin', () => {
    renderCell({ role: UserRole.SuperAdmin })
    expect(
      screen.getByText(USER_ROLE_LABELS[UserRole.SuperAdmin]),
    ).toBeInTheDocument()
  })
})
