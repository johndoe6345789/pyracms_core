import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import RoleSelectCell from '@/components/super-admin/RoleSelectCell'
import { UserRole } from '@/types'

interface RenderOptions {
  username?: string
  role?: UserRole
  onChange?: jest.Mock
}

/**
 * Renders RoleSelectCell inside a minimal table context that
 * satisfies HTML validity requirements.
 */
export function renderCell({
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

/** Opens the Select dropdown. */
export function openMenu() {
  fireEvent.mouseDown(screen.getByRole('combobox', { hidden: true }))
}
