import { render, screen, fireEvent } from '@testing-library/react'
import { PostReactions } from '@/components/forum/PostReactions'
import { toggleReaction } from '@/components/forum/reactionData'
import { QuoteButton } from '@/components/forum/QuoteButton'
import { UserPostInfo } from '@/components/forum/UserPostInfo'

const r = (label: string, count: number, reacted: boolean) => ({
  emoji: label, label, count, reacted,
})

describe('toggleReaction', () => {
  it('adds a new reaction', () => {
    expect(toggleReaction([], 'x', 'lx'))
      .toEqual([{ emoji: 'x', label: 'lx', count: 1, reacted: true }])
  })
  it('increments an unreacted one', () => {
    expect(toggleReaction([r('a', 1, false), r('b', 1, false)], 'a', 'a'))
      .toEqual([r('a', 2, true), r('b', 1, false)])
  })
  it('decrements a reacted one and removes at zero', () => {
    expect(toggleReaction([r('a', 3, true), r('b', 1, false)], 'a', 'a'))
      .toEqual([r('a', 2, false), r('b', 1, false)])
    expect(toggleReaction([r('a', 1, true)], 'a', 'a')).toEqual([])
  })
})

describe('PostReactions', () => {
  it('toggles an existing badge', () => {
    const onReact = jest.fn()
    render(<PostReactions postId="7" onReact={onReact}
      initialReactions={[r('heart', 1, true)]} />)
    fireEvent.click(screen.getByTestId('reaction-heart'))
    expect(onReact).toHaveBeenCalledWith('7', 'heart')
    expect(screen.queryByTestId('reaction-heart')).toBeNull()
  })
  it('picks from the picker', () => {
    render(<PostReactions postId="7" initialReactions={[]} />)
    fireEvent.click(screen.getByTestId('add-reaction-btn'))
    fireEvent.click(screen.getByTestId('reaction-pick-rocket'))
    expect(screen.getByTestId('reaction-rocket')).toHaveTextContent('1')
  })
  it('uses default reactions when none are given', () => {
    render(<PostReactions postId="7" />)
    expect(screen.getByTestId('reaction-thumbsup')).toBeInTheDocument()
  })
})

it('quote button emits BBCode', () => {
  const onQuote = jest.fn()
  render(<QuoteButton author="a" content="c" onQuote={onQuote} />)
  fireEvent.click(screen.getByText('Quote'))
  expect(onQuote).toHaveBeenCalledWith('[quote=a]c[/quote]\n\n')
})

it('shows user post info and rank colours', () => {
  const { rerender } = render(<UserPostInfo username="ann" joinDate="2020"
    postCount={1200} reputation={1000} rank="Gold" avatarUrl="/a.png" />)
  expect(screen.getByText('1,200 posts')).toBeInTheDocument()
  expect(screen.getByText('1,000 rep')).toBeInTheDocument()
  for (const rep of [500, 100, 5]) {
    rerender(<UserPostInfo username="ann" joinDate="2020" postCount={1}
      reputation={rep} rank="R" />)
    expect(screen.getByTestId('user-post-info-ann')).toBeInTheDocument()
  }
})
