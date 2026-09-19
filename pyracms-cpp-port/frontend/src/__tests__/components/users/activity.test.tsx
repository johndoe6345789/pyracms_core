import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityItem } from '@/components/users/ActivityItem'
import { ActivityTimeline } from '@/components/users/ActivityTimeline'
import { ActivityFilter } from '@/components/users/ActivityFilter'
import { getTypeIcon } from '@/components/users/activityIcons'
import { AchievementCard } from '@/components/users/AchievementCard'
import { ico } from '@/components/users/achievementIcons'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))

const act = (i: number, type = 'article', d = 'desc') => ({
  id: String(i), type, title: `T${i}`, description: d, date: 'today',
})

describe('activity', () => {
  it('ActivityItem renders description only when present', () => {
    const { rerender } = render(
      <ActivityItem activity={act(1)} isLast={false} />)
    expect(screen.getByText('desc')).toBeInTheDocument()
    rerender(<ActivityItem activity={act(1, 'weird', '')} isLast />)
    expect(screen.queryByText('desc')).toBeNull()
    expect(screen.getByText('weird')).toBeInTheDocument()
  })

  it('getTypeIcon falls back to the article icon', () => {
    expect(getTypeIcon('nope')).toBe(getTypeIcon('article'))
  })

  it('ActivityFilter reports the choice', () => {
    const onChange = jest.fn()
    render(<ActivityFilter value="all" onChange={onChange} />)
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Snippets' }))
    expect(onChange).toHaveBeenCalledWith('snippet')
  })

  it('ActivityTimeline paginates and filters', () => {
    const acts = Array.from({ length: 7 }, (_, i) =>
      act(i, i === 6 ? 'snippet' : 'article'))
    render(<ActivityTimeline activities={acts} />)
    expect(screen.queryByTestId('activity-item-5')).toBeNull()
    fireEvent.click(screen.getByTestId('load-more-activity'))
    expect(screen.getByTestId('activity-item-6')).toBeInTheDocument()
    expect(screen.queryByTestId('load-more-activity')).toBeNull()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Posts' }))
    expect(screen.getByText('No activity found.')).toBeInTheDocument()
  })
})

describe('AchievementCard', () => {
  const a = { id: 1, name: 'n', displayName: 'Nice', description: 'd',
    icon: 'code', earned: true, earnedAt: '2024-01-02T00:00:00Z' }

  it('shows the earned date only when earned', () => {
    const { rerender } = render(<AchievementCard a={a} />)
    expect(screen.getByText('Nice')).toBeInTheDocument()
    expect(screen.getByTestId('achievement-n').textContent)
      .toMatch(/\d/)
    rerender(<AchievementCard a={{ ...a, earned: false, icon: 'zzz' }} />)
    expect(screen.getByTestId('achievement-n').textContent).toBe('Nice')
  })

  it('has a default icon', () => {
    expect(ico.default).toBeDefined()
  })
})
