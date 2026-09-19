import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { PostReactions } from '@/components/forum/PostReactions'
import { QuoteButton } from '@/components/forum/QuoteButton'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'put' | 'delete'>(api)
beforeEach(() => {
  m.put.mockReset().mockResolvedValue({})
  m.delete.mockReset().mockResolvedValue({})
})

const r = (label: string, count: number, reacted: boolean) => ({
  emoji: label, label, count, reacted,
})

describe('PostReactions', () => {
  it('removes own reaction with DELETE', () => {
    render(<PostReactions postId="7" reactions={[r('heart', 1, true)]} />)
    fireEvent.click(screen.getByTestId('reaction-heart'))
    expect(m.delete).toHaveBeenCalledWith('/api/forum/posts/7/reactions/heart')
    expect(screen.queryByTestId('reaction-heart')).toBeNull()
  })
  it('adds from the picker with PUT', () => {
    render(<PostReactions postId="7" reactions={[]} />)
    fireEvent.click(screen.getByTestId('add-reaction-btn'))
    fireEvent.click(screen.getByTestId('reaction-pick-party'))
    expect(m.put).toHaveBeenCalledWith(
      '/api/forum/posts/7/reactions', { emoji: 'party' })
    expect(screen.getByTestId('reaction-party')).toHaveTextContent('1')
  })
  it('rolls back when the call fails', async () => {
    m.put.mockRejectedValue(new Error('x'))
    render(<PostReactions postId="7" reactions={[r('wow', 2, false)]} />)
    fireEvent.click(screen.getByTestId('reaction-wow'))
    expect(screen.getByTestId('reaction-wow')).toHaveTextContent('3')
    await waitFor(() =>
      expect(screen.getByTestId('reaction-wow')).toHaveTextContent('2'))
  })
  it('is inert for guests', () => {
    render(<PostReactions postId="7" disabled
      reactions={[r('wow', 2, false)]} />)
    expect(screen.getByTestId('add-reaction-btn')).toBeDisabled()
    fireEvent.click(screen.getByTestId('reaction-wow'))
    expect(m.put).not.toHaveBeenCalled()
  })
})

it('quote button emits BBCode', () => {
  const onQuote = jest.fn()
  render(<QuoteButton author="a" content="c" onQuote={onQuote} />)
  fireEvent.click(screen.getByText('Quote'))
  expect(onQuote).toHaveBeenCalledWith('[quote=a]c[/quote]\n\n')
})
