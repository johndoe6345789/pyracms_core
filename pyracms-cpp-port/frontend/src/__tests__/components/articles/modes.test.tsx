import { render, screen, fireEvent } from '@testing-library/react'
import { EditorModeSelector } from '@/components/articles/EditorModeSelector'
import { ViewModeToggle } from '@/components/articles/ViewModeToggle'
import { isIncompatible } from '@/components/articles/editorModes'

it('switches compatible modes directly', () => {
  const onModeChange = jest.fn()
  render(<EditorModeSelector mode="monaco" onModeChange={onModeChange} />)
  fireEvent.click(screen.getByRole('button', { name: /BBCode/ }))
  expect(onModeChange).toHaveBeenCalledWith('bbcode')
  fireEvent.click(screen.getByRole('button', { name: /Monaco/ }))
  expect(onModeChange).toHaveBeenCalledTimes(1)
})

it('cancels an incompatible switch', () => {
  const onModeChange = jest.fn()
  render(<EditorModeSelector mode="wysiwyg" onModeChange={onModeChange} />)
  fireEvent.click(screen.getByRole('button', { name: /Markdown/ }))
  expect(onModeChange).not.toHaveBeenCalled()
  expect(screen.getByText('Switch Editor Mode?')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(onModeChange).not.toHaveBeenCalled()
})

it('confirms an incompatible switch', () => {
  const onModeChange = jest.fn()
  render(<EditorModeSelector mode="wysiwyg" onModeChange={onModeChange} />)
  fireEvent.click(screen.getByRole('button', { name: /BBCode/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Switch Anyway' }))
  expect(onModeChange).toHaveBeenCalledWith('bbcode')
})

it('detects incompatible pairs', () => {
  expect(isIncompatible('bbcode', 'wysiwyg')).toBe(true)
  expect(isIncompatible('monaco', 'wysiwyg')).toBe(false)
})

it('ViewModeToggle changes mode', () => {
  const setViewMode = jest.fn()
  render(<ViewModeToggle viewMode="edit" setViewMode={setViewMode} />)
  fireEvent.click(screen.getByTestId('toggle-preview'))
  expect(setViewMode).toHaveBeenCalledWith('preview')
  fireEvent.click(screen.getByTestId('toggle-edit'))
  expect(setViewMode).toHaveBeenCalledTimes(1)
})
