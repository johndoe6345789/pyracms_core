import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UserRole, USER_ROLE_LABELS } from '@/types'
import {
  renderCell, openMenu, option,
} from '@/__tests__/helpers/roleSelectCell'

describe('RoleSelectCell change', () => {
  it('onChange is called with the new UserRole when selection changes', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    openMenu()
    // Click the SuperAdmin option
    fireEvent.click(option(UserRole.SuperAdmin))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(UserRole.SuperAdmin)
  })

  it('onChange is called with Guest role when Guest is selected', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    openMenu()
    fireEvent.click(option(UserRole.Guest))
    expect(onChange).toHaveBeenCalledWith(UserRole.Guest)
  })

  it('onChange is called with Moderator role', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    openMenu()
    fireEvent.click(option(UserRole.Moderator))
    expect(onChange).toHaveBeenCalledWith(UserRole.Moderator)
  })

  it('onChange is not called when dropdown opened but no option clicked',
    () => {
    const onChange = jest.fn()
    renderCell({ onChange })

    openMenu()
    // No click on an option
    expect(onChange).not.toHaveBeenCalled()
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
