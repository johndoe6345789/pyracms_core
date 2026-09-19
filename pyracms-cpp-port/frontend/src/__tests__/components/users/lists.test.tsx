import { render, screen, fireEvent } from '@testing-library/react'
import { FollowerList } from '@/components/users/FollowerList'
import { AchievementGrid } from '@/components/users/AchievementGrid'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('FollowerList', () => {
  const u = (i: number) => ({ userId: i, username: `u${i}`,
    avatarUrl: '', createdAt: '2024-01-01' })

  it('shows empty state', async () => {
    get.mockRejectedValue(new Error('x'))
    render(<FollowerList userId={1} type="followers" />)
    expect(await screen.findByTestId('follower-list-empty'))
      .toHaveTextContent('No followers yet')
  })

  it('loads more pages', async () => {
    get.mockResolvedValueOnce({ data: { items: [u(1)], total: 2 } })
      .mockResolvedValueOnce({ data: { items: [u(2)], total: 2 } })
    render(<FollowerList userId={1} type="following" />)
    fireEvent.click(await screen.findByTestId('load-more-followers'))
    expect(await screen.findByTestId('follower-u2')).toBeInTheDocument()
    expect(screen.getByTestId('follower-u1')).toBeInTheDocument()
  })

  it('handles a response without items', async () => {
    get.mockResolvedValue({ data: {} })
    render(<FollowerList userId={1} type="followers" />)
    expect(await screen.findByTestId('follower-list-empty'))
      .toBeInTheDocument()
  })
})

describe('AchievementGrid', () => {
  it('lists achievements and ignores errors', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 1, name: 'a',
      displayName: 'A', description: '', icon: 'star', earned: false,
      earnedAt: '' }] })
    render(<AchievementGrid userId={1} />)
    expect(await screen.findByTestId('achievement-a')).toBeInTheDocument()
    get.mockRejectedValueOnce(new Error('x'))
    render(<AchievementGrid userId={2} />)
    get.mockResolvedValueOnce({ data: null })
    render(<AchievementGrid userId={3} />)
  })
})

