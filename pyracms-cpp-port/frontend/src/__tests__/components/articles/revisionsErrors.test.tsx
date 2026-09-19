import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RevisionTable } from '@/components/articles/RevisionTable'
import { m } from '../../helpers/scopeApi'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('react-diff-viewer-continued', () => ({
  __esModule: true, DiffMethod: { WORDS: 'words' }, default: () => null,
}))

const revs = [
  { number: 2, author: 'a', date: 'd', summary: 's' },
  { number: 1, author: 'b', date: 'd', summary: 't' },
]
const boom = { response: { data: { error: 'boom' } } }

beforeEach(() => jest.resetAllMocks())

it('shows a failed revision load, cleared on retry', async () => {
  m.get.mockRejectedValueOnce(boom)
  render(<RevisionTable revisions={revs} latestRevision={2}
    articleName="n" tenantId={1} />)
  fireEvent.click(screen.getByTestId('view-rev-1'))
  expect(await screen.findByTestId('revision-error'))
    .toHaveTextContent('boom')
  m.get.mockResolvedValue({ data: {} })
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() => expect(screen.queryByTestId('revision-error'))
    .toBeNull())
})

it('shows a failed revert', async () => {
  const onRevert = jest.fn().mockRejectedValue(boom)
  render(<RevisionTable revisions={revs} latestRevision={2}
    articleName="n" tenantId={1} onRevert={onRevert} />)
  fireEvent.click(screen.getByTestId('revert-1'))
  fireEvent.click(screen.getByTestId('confirm-revert'))
  expect(await screen.findByTestId('revision-error'))
    .toHaveTextContent('boom')
})
