import { render, screen, fireEvent } from '@testing-library/react'
import TargetField from '@/components/admin/menus/TargetField'
import { SECTIONS, pageTarget } from '@/lib/menuTargets'

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
