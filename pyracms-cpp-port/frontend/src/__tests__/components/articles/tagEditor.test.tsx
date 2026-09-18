import { render, screen, fireEvent } from '@testing-library/react'
import {
  ArticleTagEditor,
} from '@/components/articles/ArticleTagEditor'

function setup(tags: string[] = ['a']) {
  const set = jest.fn()
  render(<ArticleTagEditor tagsInput={tags.join(', ')}
    setTagsInput={set} tags={tags} />)
  const input = screen.getByRole('textbox', { name: 'Tags' })
  return { set, input }
}

it('adds a tag via button', () => {
  const { set, input } = setup()
  fireEvent.change(input, { target: { value: '  new   tag ' } })
  fireEvent.click(screen.getByTestId('add-tag-btn'))
  expect(set).toHaveBeenCalledWith('a, new tag')
})

it('adds on Enter and ignores duplicates', () => {
  const { set, input } = setup()
  fireEvent.change(input, { target: { value: 'A' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(set).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: 'b' } })
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(set).toHaveBeenCalledWith('a, b')
})

it('splits comma separated input', () => {
  const { set, input } = setup()
  fireEvent.change(input, { target: { value: 'x, y, a,,z' } })
  expect(set).toHaveBeenCalledWith('a, x, y, z')
  expect(input).toHaveValue('z')
})

it('removes via chip delete and backspace', () => {
  const { set, input } = setup(['a', 'b'])
  fireEvent.keyDown(input, { key: 'Backspace' })
  expect(set).toHaveBeenLastCalledWith('a')
  const chip = screen.getByTestId('editable-tag-chip-a')
  fireEvent.click(chip.querySelector('svg')!)
  expect(set).toHaveBeenLastCalledWith('b')
})

it('backspace does nothing with no tags or draft', () => {
  const { set, input } = setup([])
  fireEvent.keyDown(input, { key: 'Backspace' })
  fireEvent.change(input, { target: { value: 'q' } })
  fireEvent.keyDown(input, { key: 'Backspace' })
  fireEvent.keyDown(input, { key: 'x' })
  expect(set).not.toHaveBeenCalled()
})
