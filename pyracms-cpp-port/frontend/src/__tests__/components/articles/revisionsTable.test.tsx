import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RevisionTable } from '@/components/articles/RevisionTable'
import { m } from '../../helpers/scopeApi'
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

it('views a revision in a dialog', async () => {
  m.get.mockResolvedValue({ data: { content: '<b>rev</b>' } })
  render(
    <RevisionTable
      revisions={revs}
      latestRevision={2}
      articleName="n"
      tenantId={1}
    />,
  )
  expect(screen.queryByTestId('revert-2')).toBeNull()
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() =>
    expect(screen.getByTestId('article-content')).toHaveTextContent('rev'),
  )
  fireEvent.click(screen.getByTestId('close-revision-dialog'))
})

it('ignores view without name/tenant and on error', async () => {
  const { rerender } = render(
    <RevisionTable revisions={revs} latestRevision={2} />,
  )
  fireEvent.click(screen.getByTestId('view-rev-1'))
  expect(m.get).not.toHaveBeenCalled()
  m.get.mockRejectedValue(new Error('x'))
  rerender(
    <RevisionTable
      revisions={revs}
      latestRevision={2}
      articleName="n"
      tenantId={1}
    />,
  )
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() => expect(m.get).toHaveBeenCalled())
  m.get.mockResolvedValue({ data: {} })
  fireEvent.click(screen.getByTestId('view-rev-1'))
  await waitFor(() =>
    expect(screen.getByTestId('article-content')).toBeInTheDocument(),
  )
})
