import { screen, fireEvent, waitFor }
  from '@testing-library/react'
import { FollowButton } from '@/components/users/FollowButton'
import { UserHeader } from '@/components/users/UserHeader'
import { renderWithStore, makeUser } from '../../helpers/renderWithStore'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('FollowButton', () => {
  it('renders nothing for guests and for yourself', () => {
    const g = renderWithStore(<FollowButton userId={2} />)
    expect(g.container).toBeEmptyDOMElement()
    const s = renderWithStore(<FollowButton userId={1} />, makeUser())
    expect(s.container).toBeEmptyDOMElement()
  })

  it('follows then unfollows', async () => {
    m.get!.mockResolvedValue({ data: { items: [] } })
    m.post!.mockResolvedValue({}); m.delete!.mockResolvedValue({})
    renderWithStore(<FollowButton userId={2} />, makeUser())
    fireEvent.click(await screen.findByText('Follow'))
    fireEvent.click(await screen.findByText('Unfollow'))
    await waitFor(() => expect(m.delete).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/users/2/follow')
  })

  it('starts as following and survives errors', async () => {
    m.get!.mockResolvedValue({ data: { items: [{ userId: 1 }] } })
    m.delete!.mockRejectedValue(new Error('x'))
    renderWithStore(<FollowButton userId={2} />, makeUser())
    fireEvent.click(await screen.findByText('Unfollow'))
    await waitFor(() => expect(m.delete).toHaveBeenCalled())
    expect(screen.getByText('Unfollow')).toBeInTheDocument()
  })

  it('ignores a failed follower lookup', async () => {
    m.get!.mockRejectedValue(new Error('x'))
    renderWithStore(<FollowButton userId={2} />, makeUser())
    expect(await screen.findByText('Follow')).toBeInTheDocument()
  })
})

describe('UserHeader', () => {
  const user = { id: 9, username: 'zed', email: '', bio: 'hi',
    location: 'NYC', avatarUrl: '', reputation: 4, createdAt: '' }

  it('shows optional bio and location', () => {
    renderWithStore(<UserHeader user={user} />)
    expect(screen.getByText('hi')).toBeInTheDocument()
    expect(screen.getByText('NYC')).toBeInTheDocument()
  })

  it('omits them when empty', () => {
    renderWithStore(<UserHeader user={{ ...user, bio: '', location: '' }} />)
    expect(screen.queryByText('NYC')).toBeNull()
  })
})
