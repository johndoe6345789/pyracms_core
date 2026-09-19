import { render, screen } from '@testing-library/react'
import { AchievementCard } from '@/components/users/AchievementCard'
import { ico } from '@/components/users/achievementIcons'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

describe('AchievementCard', () => {
  const a = {
    id: 1,
    name: 'n',
    displayName: 'Nice',
    description: 'd',
    icon: 'code',
    earned: true,
    earnedAt: '2024-01-02T00:00:00Z',
  }

  it('shows the earned date only when earned', () => {
    const { rerender } = render(<AchievementCard a={a} />)
    expect(screen.getByText('Nice')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-n').textContent).toMatch(/\d/)
    rerender(<AchievementCard a={{ ...a, earned: false, icon: 'zzz' }} />)
    expect(screen.getByTestId('achievement-n').textContent).toBe('Nice')
  })

  it('has a default icon', () => {
    expect(ico.default).toBeDefined()
  })
})
