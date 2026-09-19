/** Tests for RoleSelectCell: onChange behaviour. */
import { screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'

import { UserRole, USER_ROLE_LABELS } from '@/types'
import { renderCell, openMenu } from '../../helpers/roleSelectCell'

/** Opens the menu and clicks the option for `role`. */
function pick(role: UserRole) {
  openMenu()
  fireEvent.click(
    within(screen.getByRole('listbox')).getByText(USER_ROLE_LABELS[role]),
  )
}

describe('RoleSelectCell', () => {
  it('onChange is called with the new UserRole when selection changes', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })
    pick(UserRole.SuperAdmin)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(UserRole.SuperAdmin)
  })

  it('onChange is called with Guest role when Guest is selected', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })
    pick(UserRole.Guest)
    expect(onChange).toHaveBeenCalledWith(UserRole.Guest)
  })

  it('onChange is called with Moderator role', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })
    pick(UserRole.Moderator)
    expect(onChange).toHaveBeenCalledWith(UserRole.Moderator)
  })

  it('onChange is not called when dropdown is opened but no option clicked', () => {
    const onChange = jest.fn()
    renderCell({ onChange })
    openMenu()
    expect(onChange).not.toHaveBeenCalled()
  })
})
