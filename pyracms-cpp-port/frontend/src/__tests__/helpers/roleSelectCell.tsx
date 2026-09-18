import { render, screen, fireEvent, within } from '@testing-library/react'
import RoleSelectCell from '@/components/super-admin/RoleSelectCell'
import { UserRole, USER_ROLE_LABELS } from '@/types'

interface RenderOptions {
  username?: string
  role?: UserRole
  onChange?: jest.Mock
}

/** Renders RoleSelectCell inside a minimal valid table context. */
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

export const combo = () =>
  screen.getByRole('combobox', { hidden: true })

export const openMenu = () => fireEvent.mouseDown(combo())

/** Text node of the given role option inside the open listbox. */
export const option = (role: UserRole) =>
  within(screen.getByRole('listbox')).getByText(USER_ROLE_LABELS[role])
