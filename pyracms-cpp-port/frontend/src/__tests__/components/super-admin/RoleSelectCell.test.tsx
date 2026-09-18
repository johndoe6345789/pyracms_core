/**
 * Tests for RoleSelectCell.
 *
 * Verifies the rendered Select value, all five role options,
 * onChange behaviour, accessibility attributes and data-testid.
 */
import React from 'react'
import {
  render,
  screen,
  fireEvent,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'

import RoleSelectCell from
  '@/components/super-admin/RoleSelectCell'
import { UserRole, USER_ROLE_LABELS } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RenderOptions {
  username?: string
  role?: UserRole
  onChange?: jest.Mock
}

/**
 * Renders RoleSelectCell inside a minimal table context that
 * satisfies HTML validity requirements.
 */
function renderCell({
  username = 'testuser',
  role = UserRole.User,
  onChange = jest.fn(),
}: RenderOptions = {}) {
  return {
    onChange,
    ...render(
      <table>
        <tbody>
          <tr>
            <td>
              <RoleSelectCell
                username={username}
                role={role}
                onChange={onChange}
              />
            </td>
          </tr>
        </tbody>
      </table>,
    ),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

  it('renders all five role options when opened', () => {
    renderCell()
    // Open the dropdown
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    const listbox = screen.getByRole('listbox')
    for (const label of Object.values(USER_ROLE_LABELS)) {
      expect(
        within(listbox).getByText(label),
      ).toBeInTheDocument()
    }
  })

  it('Guest option is present', () => {
    renderCell()
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    expect(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.Guest],
      ),
    ).toBeInTheDocument()
  })

  it('User option is present', () => {
    renderCell()
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    expect(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.User],
      ),
    ).toBeInTheDocument()
  })

  it('Moderator option is present', () => {
    renderCell()
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    expect(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.Moderator],
      ),
    ).toBeInTheDocument()
  })

  it('SiteAdmin option is present', () => {
    renderCell()
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    expect(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.SiteAdmin],
      ),
    ).toBeInTheDocument()
  })

  it('SuperAdmin option is present', () => {
    renderCell()
    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    expect(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.SuperAdmin],
      ),
    ).toBeInTheDocument()
  })

  it('onChange is called with the new UserRole when selection changes', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    // Click the SuperAdmin option
    fireEvent.click(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.SuperAdmin],
      ),
    )
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(UserRole.SuperAdmin)
  })

  it('onChange is called with Guest role when Guest is selected', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    fireEvent.click(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.Guest],
      ),
    )
    expect(onChange).toHaveBeenCalledWith(UserRole.Guest)
  })

  it('onChange is called with Moderator role', () => {
    const onChange = jest.fn()
    renderCell({ role: UserRole.User, onChange })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
    fireEvent.click(
      within(screen.getByRole('listbox')).getByText(
        USER_ROLE_LABELS[UserRole.Moderator],
      ),
    )
    expect(onChange).toHaveBeenCalledWith(UserRole.Moderator)
  })

  it('onChange is not called when dropdown is opened but no option clicked', () => {
    const onChange = jest.fn()
    renderCell({ onChange })

    fireEvent.mouseDown(
      screen.getByRole('combobox', { hidden: true }),
    )
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
