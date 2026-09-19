import { render, screen, fireEvent, within } from '@testing-library/react'
import { RevisionDiffViewer } from '@/components/articles/RevisionDiffViewer'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true,
  DiffMethod: { WORDS: 'words' },
  default: (p: { oldValue: string; newValue: string; splitView: boolean }) => (
    <div data-testid="diff">
      {p.oldValue}|{p.newValue}|{String(p.splitView)}
    </div>
  ),
}))

const diffRevs = ['a', 'b', 'c'].map((id) => ({
  id,
  label: `L${id}`,
  date: 'd',
  author: 'x',
  content: `c-${id}`,
}))

beforeEach(() => jest.resetAllMocks())

it('RevisionDiffViewer handles empty and single lists', () => {
  const { unmount } = render(<RevisionDiffViewer revisions={[]} />)
  expect(screen.getByText(/No revisions/)).toBeInTheDocument()
  unmount()
  render(<RevisionDiffViewer revisions={diffRevs.slice(0, 1)} />)
  expect(screen.getByText(/Select two revisions/)).toBeInTheDocument()
})

it('RevisionDiffViewer compares and toggles view', () => {
  render(<RevisionDiffViewer revisions={diffRevs} />)
  expect(screen.getByTestId('diff')).toHaveTextContent('c-a|c-c|true')
  fireEvent.click(screen.getByRole('button', { name: 'Unified' }))
  expect(screen.getByTestId('diff')).toHaveTextContent('false')
  fireEvent.click(screen.getByRole('button', { name: 'Unified' }))
  const [from] = screen.getAllByRole('combobox')
  fireEvent.mouseDown(from!)
  fireEvent.click(within(screen.getByRole('listbox')).getByText(/Lb/))
  expect(screen.getByTestId('diff')).toHaveTextContent('c-b|c-c')
})
