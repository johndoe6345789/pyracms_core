import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RevisionTable } from '@/components/articles/RevisionTable'
import { revs } from '../../helpers/revisionsFixture'

jest.mock(
  'react-markdown',
  () => jest.requireActual('../../helpers/scopeMocks').markdownMock,
)
jest.mock(
  'remark-gfm',
  () => jest.requireActual('../../helpers/scopeMocks').gfmMock,
)

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
jest.mock('react-diff-viewer-continued', () => {
  return jest.requireActual('../../helpers/revisionsFixture').diffViewerMock
})

beforeEach(() => jest.resetAllMocks())

it('reverts after confirmation', async () => {
  const onRevert = jest.fn().mockResolvedValue(undefined)
  render(
    <RevisionTable revisions={revs} latestRevision={2} onRevert={onRevert} />,
  )
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
