import { render, screen, fireEvent } from '@testing-library/react'
import GlobalUserRowView from '@/components/super-admin/GlobalUserRowView'

const user = {
  id: 5,
  username: 'ann',
  email: 'a@x',
  role: 1,
  roleLabel: 'Normal User',
  isActive: false,
  createdAt: '2024-01-01',
}

describe('GlobalUserRowView', () => {
  it('shows a banned user and reports role changes', () => {
    const onRoleChange = jest.fn()
    render(
      <table>
        <tbody>
          <GlobalUserRowView user={user} onRoleChange={onRoleChange} />
        </tbody>
      </table>,
    )
    expect(screen.getByText('Banned')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Moderator' }))
    expect(onRoleChange).toHaveBeenCalledWith(5, 2)
  })
})
