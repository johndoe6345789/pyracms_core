import { render, screen, fireEvent } from '@testing-library/react'
import { UserProfileCard } from '@/components/users/UserProfileCard'

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
