import { screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import {
  renderCell, combo, openMenu, option,
} from '@/__tests__/helpers/roleSelectCell'

describe('RoleSelectCell options', () => {
  it('renders a Select with the current role value', () => {
    renderCell({ role: UserRole.Moderator })
    // MUI Select displays the selected label as visible text
    expect(
      screen.getByText(USER_ROLE_LABELS[UserRole.Moderator]),
    ).toBeInTheDocument()
  })

  it('data-testid includes the username', () => {
    renderCell({ username: 'carol' })
    expect(screen.getByTestId('role-select-carol')).toBeInTheDocument()
  })

  it('aria-label includes the username', () => {
    renderCell({ username: 'dave' })
    expect(combo()).toHaveAttribute('aria-label', 'Role for dave')
  })

  it('renders all five role options when opened', () => {
    renderCell()
    openMenu()
    const listbox = screen.getByRole('listbox')
    for (const label of Object.values(USER_ROLE_LABELS)) {
      expect(within(listbox).getByText(label)).toBeInTheDocument()
    }
  })

  it('Guest option is present', () => {
    renderCell()
    openMenu()
    expect(option(UserRole.Guest)).toBeInTheDocument()
  })

  it('User option is present', () => {
    renderCell()
    openMenu()
    expect(option(UserRole.User)).toBeInTheDocument()
  })

  it('Moderator option is present', () => {
    renderCell()
    openMenu()
    expect(option(UserRole.Moderator)).toBeInTheDocument()
  })

  it('SiteAdmin option is present', () => {
    renderCell()
    openMenu()
    expect(option(UserRole.SiteAdmin)).toBeInTheDocument()
  })

  it('SuperAdmin option is present', () => {
    renderCell()
    openMenu()
    expect(option(UserRole.SuperAdmin)).toBeInTheDocument()
  })
})
