import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RevisionTable } from '@/components/articles/RevisionTable'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  DiffMethod: { WORDS: 'words' },
  default: (p: { oldValue: string; newValue: string; splitView: boolean }) =>
    <div data-testid="diff">
      {p.oldValue}|{p.newValue}|{String(p.splitView)}
    </div>,
}))

const revs = [
  { number: 2, author: 'a', date: 'd', summary: 's' },
  { number: 1, author: 'b', date: 'd', summary: 't' },
]

beforeEach(() => jest.resetAllMocks())

it('views a revision in a dialog', async () => {
  m.get.mockResolvedValue({ data: { content: '<b>rev</b>' } })
  render(<RevisionTable revisions={revs} latestRevision={2}
    articleName="n" tenantId={1} />)
  expect(screen.queryByTestId('revert-2')).toBeNull()
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() => expect(screen.getByTestId('revision-content'))
    .toHaveTextContent('rev'))
  fireEvent.click(screen.getByTestId('close-revision-dialog'))
})

it('ignores view without name/tenant and on error', async () => {
  const { rerender } = render(<RevisionTable revisions={revs}
    latestRevision={2} />)
  fireEvent.click(screen.getByTestId('view-rev-1'))
  expect(m.get).not.toHaveBeenCalled()
  m.get.mockRejectedValue(new Error('x'))
  rerender(<RevisionTable revisions={revs} latestRevision={2}
    articleName="n" tenantId={1} />)
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  m.get.mockResolvedValue({ data: {} })
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() => expect(screen.getByTestId('revision-content'))
    .toBeInTheDocument())
})

it('reverts after confirmation', async () => {
  const onRevert = jest.fn().mockResolvedValue(undefined)
  render(<RevisionTable revisions={revs} latestRevision={2}
    onRevert={onRevert} />)
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('cancel-revert'))
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  await waitFor(() => expect(onRevert).toHaveBeenCalledWith(1))
  onRevert.mockRejectedValue(new Error('x'))
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  await waitFor(() => expect(onRevert).toHaveBeenCalledTimes(2))
})

it('confirm without handler does nothing', () => {
  render(<RevisionTable revisions={revs} latestRevision={2} />)
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
})
