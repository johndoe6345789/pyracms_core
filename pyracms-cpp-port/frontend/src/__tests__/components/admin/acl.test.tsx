import { render, screen, fireEvent, within } from '@testing-library/react'
import AclRuleTable from '@/components/admin/AclRuleTable'
import AddAclRuleForm from '@/components/admin/AddAclRuleForm'

const rules = [
  { id: 1, action: 'Allow' as const, principal: 'admin', permission: 'x' },
  { id: 2, action: 'Deny' as const, principal: 'guest', permission: 'y' },
]

it('renders rules and deletes', () => {
  const onDelete = jest.fn()
  render(<AclRuleTable rules={rules} onDelete={onDelete} />)
  expect(screen.getByTestId('acl-row-2')).toHaveTextContent('guest')
  fireEvent.click(screen.getByTestId('delete-acl-1'))
  expect(onDelete).toHaveBeenCalledWith(1)
})

const setup = (principal = '', permission = '') => {
  const p = {
    onActionChange: jest.fn(), onPrincipalChange: jest.fn(),
    onPermissionChange: jest.fn(), onAdd: jest.fn(),
  }
  render(
    <AddAclRuleForm newAction="Allow" newPrincipal={principal}
      newPermission={permission} {...p} />)
  return p
}

it('disables add until filled', () => {
  setup(' ', 'x')
  expect(screen.getByTestId('add-acl-rule-btn')).toBeDisabled()
})

it('emits form events', () => {
  const p = setup('a', 'b')
  fireEvent.change(
    within(screen.getByTestId('acl-principal-input')).getByRole('textbox'),
    { target: { value: 'z' } })
  expect(p.onPrincipalChange).toHaveBeenCalledWith('z')
  fireEvent.change(
    within(screen.getByTestId('acl-permission-input')).getByRole('textbox'),
    { target: { value: 'q' } })
  expect(p.onPermissionChange).toHaveBeenCalledWith('q')
  fireEvent.click(screen.getByTestId('add-acl-rule-btn'))
  expect(p.onAdd).toHaveBeenCalled()
  const sel = screen.getByTestId('acl-action-select')
  fireEvent.mouseDown(within(sel).getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Deny' }))
  expect(p.onActionChange).toHaveBeenCalledWith('Deny')
})
