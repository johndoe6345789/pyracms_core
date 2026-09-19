/** Tests for RoleSelectCell: dropdown options. */
import { screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'

import { UserRole, USER_ROLE_LABELS } from '@/types'
import {
  renderCell, openMenu,
} from '../../helpers/roleSelectCell'

/** Asserts the open listbox contains the label for `role`. */
function expectOption(role: UserRole) {
  expect(
    within(screen.getByRole('listbox')).getByText(
      USER_ROLE_LABELS[role],
    ),
  ).toBeInTheDocument()
}

describe('RoleSelectCell', () => {
  it('renders all five role options when opened', () => {
    renderCell()
    openMenu()
    const listbox = screen.getByRole('listbox')
    for (const label of Object.values(USER_ROLE_LABELS)) {
      expect(
        within(listbox).getByText(label),
      ).toBeInTheDocument()
    }
  })

  it('Guest option is present', () => {
    renderCell()
    openMenu()
    expectOption(UserRole.Guest)
  })

  it('User option is present', () => {
    renderCell()
    openMenu()
    expectOption(UserRole.User)
  })

  it('Moderator option is present', () => {
    renderCell()
    openMenu()
    expectOption(UserRole.Moderator)
  })

  it('SiteAdmin option is present', () => {
    renderCell()
    openMenu()
    expectOption(UserRole.SiteAdmin)
  })

  it('SuperAdmin option is present', () => {
    renderCell()
    openMenu()
    expectOption(UserRole.SuperAdmin)
  })
})
