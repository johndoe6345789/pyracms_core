import { render, screen, fireEvent } from '@testing-library/react'
import UserPage from '@/app/site/[slug]/(tenant)/users/[username]/page'

jest.mock('next/navigation', () => ({
  useParams: () => ({ username: 'zed' }),
}))
let profile = { user: null as unknown, loading: true }
jest.mock('@/components/users/useUserProfile', () => ({
  useUserProfile: () => profile,
}))
jest.mock('@/components/users/UserHeader', () => ({
  UserHeader: () => <div data-testid="uh" />,
}))
jest.mock('@/components/users/ActivityTimeline', () => ({
  ActivityTimeline: () => <div>ACT</div>,
}))
jest.mock('@/components/users/AchievementGrid', () => ({
  AchievementGrid: () => <div>ACH</div>,
}))
jest.mock('@/components/users/FollowerList', () => ({
  FollowerList: (p: { type: string }) => <div>FL-{p.type}</div>,
}))

describe('UserProfilePage', () => {
  it('shows skeletons, not-found and the tabbed profile', () => {
    const { rerender } = render(<UserPage />)
    expect(screen.queryByText('User not found')).toBeNull()
    profile = { user: null, loading: false }
    rerender(<UserPage />)
    expect(screen.getByText('User not found')).toBeInTheDocument()
    profile = { user: { id: 3 }, loading: false }
    rerender(<UserPage />)
    expect(screen.getByText('ACT')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Achievements'))
    expect(screen.getByText('ACH')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Followers'))
    expect(screen.getByText('FL-followers')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Following'))
    expect(screen.getByText('FL-following')).toBeInTheDocument()
  })
})
