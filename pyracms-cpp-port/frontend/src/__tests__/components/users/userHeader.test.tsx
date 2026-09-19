import { render, screen } from '@testing-library/react'
import { UserHeader, type UserProfile } from '@/components/users/UserHeader'

jest.mock('@/components/users/FollowButton', () => ({
  FollowButton: (p: { userId: number }) => (
    <button data-testid="follow">f{p.userId}</button>),
}))

const user: UserProfile = {
  id: 4, username: 'zed', email: '', bio: 'about zed',
  website: 'http://z.dev', avatarUrl: '', reputation: 1500,
  postCount: 12, createdAt: '2024-03-05T10:00:00',
}

describe('UserHeader', () => {
  it('combines follow, reputation, info, stats and badges', () => {
    render(<UserHeader user={user} />)
    expect(screen.getByTestId('follow')).toHaveTextContent('f4')
    expect(screen.getByText('about zed')).toBeInTheDocument()
    expect(screen.getByTestId('website-link')).toHaveTextContent('z.dev')
    expect(screen.getByText('Joined 2024-03-05')).toBeInTheDocument()
    expect(screen.getByTestId('profile-stats')).toHaveTextContent('12')
    expect(screen.getAllByText('Expert').length).toBeGreaterThan(1)
  })

  it('omits optional parts', () => {
    render(<UserHeader user={{ ...user, bio: '', website: '' }} />)
    expect(screen.queryByTestId('website-link')).toBeNull()
    expect(screen.queryByText('about zed')).toBeNull()
  })
})
