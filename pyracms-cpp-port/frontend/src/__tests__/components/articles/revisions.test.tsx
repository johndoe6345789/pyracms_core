import { render, screen, fireEvent } from '@testing-library/react'
import { RevisionRow } from '@/components/articles/RevisionRow'
import {
  RevisionViewDialog,
} from '@/components/articles/RevisionViewDialog'
import {
  RevertConfirmDialog,
} from '@/components/articles/RevertConfirmDialog'
import {
  RevisionDiffViewer,
} from '@/components/articles/RevisionDiffViewer'

jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  default: (p: { oldValue: string; newValue: string;
    splitView: boolean; leftTitle: string }) => (
    <div data-testid="diff">
      {p.oldValue}|{p.newValue}|{String(p.splitView)}|{p.leftTitle}
    </div>),
  DiffMethod: { WORDS: 'words' },
}))

const rev = { number: 2, author: 'ann', date: 'today', summary: 'sum' }

function row(isLatest: boolean, v = jest.fn(), r = jest.fn()) {
  render(<table><tbody>
    <RevisionRow rev={rev} isLatest={isLatest} onView={v} onRevert={r} />
  </tbody></table>)
  return { v, r }
}

it('row shows view and revert', () => {
  const { v, r } = row(false)
  fireEvent.click(screen.getByTestId('view-rev-2'))
  fireEvent.click(screen.getByTestId('revert-2'))
  expect(v).toHaveBeenCalledWith(rev)
  expect(r).toHaveBeenCalledWith(2)
  expect(screen.getByText('sum')).toBeInTheDocument()
})

it('latest row has no revert', () => {
  row(true)
  expect(screen.queryByTestId('revert-2')).toBeNull()
})

it('view dialog shows revision', () => {
  const onClose = jest.fn()
  render(<RevisionViewDialog open onClose={onClose} revision={rev}
    sanitizedContent="<i>c</i>" />)
  expect(screen.getByTestId('revision-content').innerHTML).toBe('<i>c</i>')
  expect(screen.getByText(/Revision 2/)).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('close-revision-dialog'))
  expect(onClose).toHaveBeenCalled()
})

it('view dialog tolerates missing revision', () => {
  render(<RevisionViewDialog open onClose={jest.fn()} revision={null}
    sanitizedContent="" />)
  expect(screen.getByTestId('revision-content')).toBeInTheDocument()
})

it('revert dialog confirms and cancels', () => {
  const c = jest.fn()
  const ok = jest.fn()
  const { rerender } = render(
    <RevertConfirmDialog revisionNumber={3} onClose={c} onConfirm={ok} />)
  expect(screen.getByText('Revert to revision 3?')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('cancel-revert'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  expect(c).toHaveBeenCalled()
  expect(ok).toHaveBeenCalled()
  rerender(
    <RevertConfirmDialog revisionNumber={null} onClose={c} onConfirm={ok} />)
  expect(screen.queryByTestId('confirm-revert')).toBeNull()
})

const d = (id: string, content: string) =>
  ({ id, label: `R${id}`, date: 'd', author: 'a', content })

it('diff viewer handles no revisions', () => {
  render(<RevisionDiffViewer revisions={[]} />)
  expect(screen.getByText(/No revisions available/)).toBeInTheDocument()
})

it('diff viewer prompts with a single revision', () => {
  render(<RevisionDiffViewer revisions={[d('1', 'x')]} />)
  expect(screen.getByText(/Select two revisions/)).toBeInTheDocument()
})

it('diff viewer compares first and last, toggles view', () => {
  render(<RevisionDiffViewer
    revisions={[d('1', 'old'), d('2', 'mid'), d('3', 'new')]} />)
  const diff = screen.getByTestId('diff')
  expect(diff).toHaveTextContent('old|new|true|R1 (a - d)')
  fireEvent.click(screen.getByText('Unified'))
  expect(screen.getByTestId('diff')).toHaveTextContent('old|new|false')
  fireEvent.click(screen.getByText('Unified'))
  fireEvent.click(screen.getByText('Side by Side'))
  expect(screen.getByTestId('diff')).toHaveTextContent('true')
})

it('diff viewer changes selection', () => {
  render(<RevisionDiffViewer
    revisions={[d('1', 'old'), d('2', 'mid'), d('3', 'new')]} />)
  const boxes = screen.getAllByRole('combobox')
  fireEvent.mouseDown(boxes[0]!)
  fireEvent.click(screen.getByRole('option', { name: /R2/ }))
  expect(screen.getByTestId('diff')).toHaveTextContent('mid|new')
  fireEvent.mouseDown(screen.getAllByRole('combobox')[1]!)
  fireEvent.click(screen.getByRole('option', { name: /R2/ }))
  expect(screen.getByTestId('diff')).toHaveTextContent('mid|mid')
})
