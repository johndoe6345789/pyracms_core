import { render, screen, fireEvent, within } from '@testing-library/react'
import AclRuleTable from '@/components/admin/AclRuleTable'
import AddAclRuleForm from '@/components/admin/AddAclRuleForm'

const rules = [
  { id: 1, action: 'Allow' as const, principal: 'admin', permission: 'a' },
  { id: 2, action: 'Deny' as const, principal: 'guest', permission: 'b' },
]

it('renders rules and deletes one', () => {
  const onDelete = jest.fn()
  render(<AclRuleTable rules={rules} onDelete={onDelete} />)
  expect(screen.getByTestId('acl-row-1')).toHaveTextContent('admin')
  expect(screen.getByTestId('acl-row-2')).toHaveTextContent('Deny')
  fireEvent.click(screen.getByTestId('delete-acl-2'))
  expect(onDelete).toHaveBeenCalledWith(2)
})

function form(over = {}) {
  const p = {
    newAction: 'Allow' as const,
    newPrincipal: '',
    newPermission: '',
    onActionChange: jest.fn(),
    onPrincipalChange: jest.fn(),
    onPermissionChange: jest.fn(),
    onAdd: jest.fn(),
    ...over,
  }
  render(<AddAclRuleForm {...p} />)
  return p
}

it('disables add until both fields are filled', () => {
  form()
  expect(screen.getByTestId('add-acl-rule-btn')).toBeDisabled()
})

it('reports field edits and add clicks', () => {
  const p = form({ newPrincipal: 'p', newPermission: 'q' })
  const inp = (id: string) =>
    within(screen.getByTestId(id)).getByRole('textbox')
  fireEvent.change(inp('acl-principal-input'), { target: { value: 'z' } })
  fireEvent.change(inp('acl-permission-input'), { target: { value: 'y' } })
  expect(p.onPrincipalChange).toHaveBeenCalledWith('z')
  expect(p.onPermissionChange).toHaveBeenCalledWith('y')
  fireEvent.click(screen.getByTestId('add-acl-rule-btn'))
  expect(p.onAdd).toHaveBeenCalled()
})

it('changes the action via the select', () => {
  const p = form()
  const sel = within(screen.getByTestId('acl-action-select'))
  fireEvent.mouseDown(sel.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Deny' }))
  expect(p.onActionChange).toHaveBeenCalledWith('Deny')
})
