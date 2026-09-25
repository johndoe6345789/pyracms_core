import { render, screen, fireEvent } from '@testing-library/react'
import TargetField from '@/components/admin/menus/TargetField'
import MenuItemDialog from '@/components/admin/menus/MenuItemDialog'
import { SECTIONS, pageTarget } from '@/lib/menuTargets'
import { newDraft } from '@/lib/menuDraft'
import { menuRow } from '../../helpers/menuRow'

const targets = [...SECTIONS, pageTarget('Trainz', 'Trainz')]
const type = (v: string) =>
  fireEvent.change(screen.getByTestId('menu-target-input'), {
    target: { value: v },
  })

it('suggests pages by title, grouped, and picks one', () => {
  const onChange = jest.fn()
  render(
    <TargetField value="" targets={targets} slug="rog" onChange={onChange} />,
  )
  fireEvent.focus(screen.getByTestId('menu-target-input'))
  type('train')
  fireEvent.click(screen.getByRole('option', { name: /Trainz/ }))
  expect(onChange).toHaveBeenLastCalledWith('/articles/Trainz')
})

it('takes a typed path or link, flags a bad one, ignores plain words', () => {
  const onChange = jest.fn()
  render(
    <TargetField value="" targets={targets} slug="rog" onChange={onChange} />,
  )
  type('/about')
  expect(onChange).toHaveBeenLastCalledWith('/about')
  type('//x')
  expect(screen.getByText(/single \//)).toBeInTheDocument()
  type('trai')
  expect(onChange).toHaveBeenLastCalledWith('') // not a route until picked
})

it('says where an existing link goes', () => {
  render(
    <TargetField
      value="/articles/Trainz"
      targets={targets}
      slug="rog"
      onChange={jest.fn()}
    />,
  )
  expect(
    screen.getByText(/Opens \/site\/rog\/articles\/Trainz/),
  ).toBeInTheDocument()
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
