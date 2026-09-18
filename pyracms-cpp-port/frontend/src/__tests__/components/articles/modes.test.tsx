import { render, screen, fireEvent } from '@testing-library/react'
import {
  EditorModeSelector,
} from '@/components/articles/EditorModeSelector'
import { isIncompatible } from '@/components/articles/editorModes'
import { ViewModeToggle } from '@/components/articles/ViewModeToggle'
import { EditorViewToggle } from '@/components/articles/EditorViewToggle'

it('detects incompatible pairs', () => {
  expect(isIncompatible('wysiwyg', 'bbcode')).toBe(true)
  expect(isIncompatible('monaco', 'bbcode')).toBe(false)
})

it('switches compatible modes directly', () => {
  const on = jest.fn()
  render(<EditorModeSelector mode="monaco" onModeChange={on} />)
  fireEvent.click(screen.getByRole('button', { name: /BBCode/ }))
  expect(on).toHaveBeenCalledWith('bbcode')
  fireEvent.click(screen.getByRole('button', { name: /Monaco/ }))
  expect(on).toHaveBeenCalledTimes(1)
})

it('confirms incompatible switch', () => {
  const on = jest.fn()
  render(<EditorModeSelector mode="wysiwyg" onModeChange={on} />)
  fireEvent.click(screen.getByRole('button', { name: /Markdown/ }))
  expect(on).not.toHaveBeenCalled()
  expect(screen.getByText('Switch Editor Mode?')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Cancel'))
  fireEvent.click(screen.getByRole('button', { name: /Markdown/ }))
  fireEvent.click(screen.getByText('Switch Anyway'))
  expect(on).toHaveBeenCalledWith('markdown')
})

it('view mode toggle switches', () => {
  const set = jest.fn()
  render(<ViewModeToggle viewMode="edit" setViewMode={set} />)
  fireEvent.click(screen.getByTestId('toggle-preview'))
  expect(set).toHaveBeenCalledWith('preview')
  fireEvent.click(screen.getByTestId('toggle-edit'))
  expect(set).toHaveBeenCalledTimes(1)
})

it('editor view toggle switches', () => {
  const set = jest.fn()
  render(<EditorViewToggle viewMode="edit" onViewModeChange={set} />)
  fireEvent.click(screen.getByTestId('view-mode-split'))
  fireEvent.click(screen.getByTestId('view-mode-preview'))
  expect(set.mock.calls).toEqual([['split'], ['preview']])
})
