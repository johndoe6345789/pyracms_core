import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SnippetToolbar } from '@/components/code/SnippetToolbar'

const fns = {
  onRun: jest.fn(),
  onFork: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
}
const base = {
  runnable: true,
  running: false,
  isOwner: false,
  code: 'print(1)',
  ...fns,
}

beforeEach(() => {
  Object.values(fns).forEach((f) => f.mockClear())
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  })
})

it('runs and forks', () => {
  render(<SnippetToolbar {...base} />)
  fireEvent.click(screen.getByTestId('run-snippet-btn'))
  fireEvent.click(screen.getByTestId('fork-snippet-btn'))
  expect(fns.onRun).toHaveBeenCalled()
  expect(fns.onFork).toHaveBeenCalled()
  expect(screen.queryByTestId('edit-snippet-btn')).toBeNull()
})

it('disables run when unsupported or running', () => {
  const { rerender } = render(<SnippetToolbar {...base} runnable={false} />)
  expect(screen.getByTestId('run-snippet-btn')).toBeDisabled()
  rerender(<SnippetToolbar {...base} running />)
  expect(screen.getByText('Running...')).toBeInTheDocument()
})

it('copies code and link with feedback', async () => {
  render(<SnippetToolbar {...base} />)
  fireEvent.click(screen.getByTestId('copy-snippet-btn'))
  await screen.findByText('Copied')
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('print(1)')
  fireEvent.click(screen.getByTestId('share-snippet-btn'))
  await screen.findByText('Link copied')
})

it('survives clipboard failures', async () => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockRejectedValue(new Error('x')) },
  })
  render(<SnippetToolbar {...base} />)
  fireEvent.click(screen.getByTestId('copy-snippet-btn'))
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled())
  expect(screen.queryByText('Copied')).toBeNull()
})

it('shows owner buttons', () => {
  render(<SnippetToolbar {...base} isOwner />)
  fireEvent.click(screen.getByTestId('edit-snippet-btn'))
  fireEvent.click(screen.getByTestId('delete-snippet-btn'))
  expect(fns.onEdit).toHaveBeenCalled()
  expect(fns.onDelete).toHaveBeenCalled()
})
