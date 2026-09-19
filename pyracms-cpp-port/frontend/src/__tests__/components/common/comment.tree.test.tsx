import { fireEvent } from '@testing-library/react'
import CommentList from '@/components/common/comment/CommentList'
import { renderPlain as renderWithStore } from '../../helpers/plainStore'
import { m } from '../../helpers/scopeApi'
import { mk } from '../../helpers/commentTreeFixture'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('CommentList', () => {
  const p = { contentType: 'a', contentId: 1, onRefresh: jest.fn() }
  it('shows loading, empty and populated states', () => {
    const l = renderWithStore(<CommentList {...p} loading comments={[]} />)
    expect(l.container.querySelector('[role=progressbar]')).not.toBeNull()
    const e = renderWithStore(
      <CommentList {...p} loading={false} comments={[]} />,
    )
    expect(e.getByText(/Be the first/)).toBeInTheDocument()
    const c = renderWithStore(
      <CommentList {...p} loading={false} comments={[mk(1, [mk(2)])]} />,
    )
    expect(c.getAllByText('c1')).toHaveLength(1)
    expect(c.getByText('c2')).toBeInTheDocument()
  })

  it('toggles replies', () => {
    const r = renderWithStore(
      <CommentList {...p} loading={false} comments={[mk(1, [mk(2), mk(3)])]} />,
    )
    const t = r.getByTestId('toggle-replies-btn')
    expect(t).toHaveTextContent('Hide 2 replies')
    fireEvent.click(t)
    expect(t).toHaveTextContent('Show 2 replies')
  })
})
