import { render, screen } from '@testing-library/react'
import { buildTree, timeAgo } from '@/components/common/comment/types'
import CommentHeader from '@/components/common/comment/CommentHeader'
import { c } from '../../helpers/commentPartsFixture'

describe('timeAgo', () => {
  const ago = (ms: number) => timeAgo(new Date(Date.now() - ms).toISOString())
  it('buckets durations', () => {
    expect(ago(1000)).toBe('just now')
    expect(ago(5 * 60000)).toBe('5m ago')
    expect(ago(3 * 3600000)).toBe('3h ago')
    expect(ago(2 * 86400000)).toBe('2d ago')
    expect(ago(65 * 86400000)).toBe('2mo ago')
  })
})

describe('CommentHeader', () => {
  it('flags edited comments', () => {
    const { rerender } = render(<CommentHeader comment={c} />)
    expect(screen.queryByText('(edited)')).toBeNull()
    rerender(<CommentHeader comment={{ ...c, updatedAt: 'later' }} />)
    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })
})

describe('buildTree', () => {
  it('nests by parentId and roots orphans', () => {
    const t = buildTree([
      c,
      { ...c, id: 2, parentId: 1 },
      { ...c, id: 3, parentId: 99 },
    ])
    expect(t.map((n) => n.id)).toEqual([1, 3])
    expect(t[0]!.children.map((n) => n.id)).toEqual([2])
  })
})

it('links the author to their profile inside a site', () => {
  render(<CommentHeader comment={c} />)
  expect(screen.queryByTestId('comment-author-link')).toBeNull()
})
