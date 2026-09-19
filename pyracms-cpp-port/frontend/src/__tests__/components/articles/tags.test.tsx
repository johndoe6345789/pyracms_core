import { render, screen, fireEvent, within } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { ArticleTagEditor } from '@/components/articles/ArticleTagEditor'
import { useTagDraft } from '@/components/articles/useTagDraft'

const input = () =>
  within(screen.getByTestId('tags-input')).getByRole('textbox')

const setup = (tags: string[] = ['a']) => {
  const set = jest.fn()
  render(
    <ArticleTagEditor
      tagsInput={tags.join(', ')}
      setTagsInput={set}
      tags={tags}
    />,
  )
  return set
}

it('adds a tag with the button', () => {
  const set = setup()
  expect(screen.getByTestId('add-tag-btn')).toBeDisabled()
  fireEvent.change(input(), { target: { value: ' New  tag ' } })
  fireEvent.click(screen.getByTestId('add-tag-btn'))
  expect(set).toHaveBeenCalledWith('a, New tag')
})

it('adds on Enter, dedupes, removes on backspace', () => {
  const set = setup()
  fireEvent.change(input(), { target: { value: 'A' } })
  fireEvent.keyDown(input(), { key: 'Enter' })
  expect(set).not.toHaveBeenCalled()
  fireEvent.keyDown(input(), { key: 'Backspace' })
  expect(set).toHaveBeenCalledWith('')
})

it('splits comma input and deletes chips', () => {
  const set = setup()
  fireEvent.change(input(), { target: { value: 'b, ,a,c' } })
  expect(set).toHaveBeenCalledWith('a, b')
  fireEvent.click(
    within(screen.getByTestId('editable-tag-chip-a')).getByTestId('CancelIcon'),
  )
  expect(set).toHaveBeenCalledWith('')
})

it('useTagDraft handles empty tags and other keys', () => {
  const set = jest.fn()
  const { result } = renderHook(() => useTagDraft([], set))
  act(() =>
    result.current.handleKeyDown({
      key: 'Backspace',
      preventDefault: jest.fn(),
    }),
  )
  act(() =>
    result.current.handleKeyDown({ key: 'x', preventDefault: jest.fn() }),
  )
  act(() => result.current.addTag('   '))
  expect(set).not.toHaveBeenCalled()
  expect(result.current.draftTag).toBe('')
})
