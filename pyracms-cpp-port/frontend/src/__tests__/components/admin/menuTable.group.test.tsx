import { render, screen, fireEvent } from '@testing-library/react'
import MenuGroupSelect from '@/components/admin/MenuGroupSelect'

it('MenuGroupSelect changes group and creates', () => {
  const onGroupChange = jest.fn()
  const onNewGroup = jest.fn()
  render(
    <MenuGroupSelect
      menuGroups={[
        { id: 1, name: 'main', items: [] },
        { id: 2, name: 'foot', items: [] },
      ]}
      selectedGroup="main"
      onGroupChange={onGroupChange}
      onNewGroup={onNewGroup}
    />,
  )
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'foot' }))
  expect(onGroupChange).toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: /New Menu Group/ }))
  expect(onNewGroup).toHaveBeenCalled()
})
