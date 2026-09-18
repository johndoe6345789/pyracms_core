import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileActions } from '@/components/users/ProfileActions'
import { ProfileInfo } from '@/components/users/ProfileInfo'
import { ProfileStats } from '@/components/users/ProfileStats'
import { ProfileBadges } from '@/components/users/ProfileBadges'
import { UserProfileCard } from '@/components/users/UserProfileCard'

describe('profile parts', () => {
  it('ProfileActions renders nothing without links', () => {
    const { container } = render(<ProfileActions />)
    expect(container).toBeEmptyDOMElement()
  })

  it('ProfileActions renders both links', () => {
    render(<ProfileActions githubUrl="http://g" twitterUrl="http://t" />)
    expect(screen.getByTestId('github-link'))
      .toHaveAttribute('href', 'http://g')
    expect(screen.getByTestId('twitter-link'))
      .toHaveAttribute('href', 'http://t')
  })

  it('ProfileActions renders a single link', () => {
    render(<ProfileActions twitterUrl="http://t" />)
    expect(screen.queryByTestId('github-link')).toBeNull()
    expect(screen.getByTestId('twitter-link')).toBeInTheDocument()
  })

  it('ProfileInfo shows optional fields', () => {
    render(<ProfileInfo location="Paris" website="http://w" joinDate="X" />)
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByTestId('website-link'))
      .toHaveAttribute('href', 'http://w')
    expect(screen.getByText('Joined X')).toBeInTheDocument()
  })

  it('ProfileInfo hides missing fields', () => {
    render(<ProfileInfo joinDate="Y" />)
    expect(screen.queryByTestId('website-link')).toBeNull()
    expect(screen.getByText('Joined Y')).toBeInTheDocument()
  })

  it('ProfileStats formats numbers', () => {
    render(<ProfileStats postCount={1234} reputation={5678} />)
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('5,678')).toBeInTheDocument()
  })

  it('ProfileBadges hides when empty and lists labels', () => {
    const { container, rerender } = render(<ProfileBadges badges={[]} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<ProfileBadges badges={[{ label: 'Pro', color: '#fff' }]} />)
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })
})

describe('UserProfileCard', () => {
  const base = {
    username: 'bob', bio: 'hi', joinDate: 'J', postCount: 1,
    reputation: 2, badges: [],
  }

  it('renders minimal profile and toggles follow', () => {
    const onFollow = jest.fn()
    render(<UserProfileCard {...base} onFollow={onFollow} />)
    const btn = screen.getByTestId('follow-button')
    expect(btn).toHaveTextContent('Follow')
    fireEvent.click(btn)
    expect(btn).toHaveTextContent('Unfollow')
    expect(onFollow).toHaveBeenCalledTimes(1)
  })

  it('renders every optional part and works without callback', () => {
    render(<UserProfileCard {...base} isFollowing avatarUrl="http://a/x.png"
      location="L" website="http://w" githubUrl="http://g"
      twitterUrl="http://t" badges={[{ label: 'B', color: '#000' }]} />)
    const btn = screen.getByTestId('follow-button')
    expect(btn).toHaveTextContent('Unfollow')
    fireEvent.click(btn)
    expect(btn).toHaveTextContent('Follow')
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByTestId('github-link')).toBeInTheDocument()
  })
})
