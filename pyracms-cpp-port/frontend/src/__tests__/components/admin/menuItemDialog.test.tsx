import { render, screen, fireEvent } from '@testing-library/react'
import MenuItemDialog from '@/components/admin/menus/MenuItemDialog'
import { SECTIONS, pageTarget } from '@/lib/menuTargets'
import { newDraft } from '@/lib/menuDraft'
import { menuRow } from '../../helpers/menuRow'

const targets = [...SECTIONS, pageTarget('Trainz', 'Trainz')]
const type = (v: string) =>
  fireEvent.change(screen.getByTestId('menu-target-input'), {
    target: { value: v },
  })

const dialog = (over = {}) =>
  render(
    <MenuItemDialog
      title="Add a link"
      initial={newDraft()}
      editing={false}
      folders={[menuRow({ id: 3, name: 'Trainz', type: 'folder' })]}
      targets={targets}
      slug="rog"
      busy={false}
      onClose={jest.fn()}
      onSave={jest.fn()}
      {...over}
    />,
  )

it('needs a name and a valid link before it can be added', () => {
  const onSave = jest.fn()
  dialog({ onSave })
  const save = screen.getByTestId('menu-save-btn')
  expect(save).toBeDisabled()
  fireEvent.change(screen.getByTestId('menu-name-input'), {
    target: { value: 'About' },
  })
  expect(save).toBeDisabled()
  type('/about')
  expect(save).toBeEnabled()
  fireEvent.click(save)
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'About', route: '/about', kind: 'route' }),
  )
})

it('a folder needs only a name and hides the link and folder fields', () => {
  const onSave = jest.fn()
  dialog({ onSave })
  fireEvent.click(screen.getByTestId('kind-folder'))
  expect(screen.queryByTestId('menu-target-input')).toBeNull()
  expect(screen.queryByTestId('menu-parent-select')).toBeNull()
  fireEvent.change(screen.getByTestId('menu-name-input'), {
    target: { value: 'Dir' },
  })
  fireEvent.click(screen.getByTestId('menu-save-btn'))
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Dir', kind: 'folder' }),
  )
})

it('offers folders to file a link under', () => {
  dialog()
  expect(screen.getByTestId('menu-parent-select')).toBeInTheDocument()
  expect(screen.getByTestId('menu-permissions-select')).toBeInTheDocument()
})
