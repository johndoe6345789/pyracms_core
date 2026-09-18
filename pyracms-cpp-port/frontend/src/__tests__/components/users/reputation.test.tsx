import { render, screen } from '@testing-library/react'
import { ReputationBadge } from '@/components/users/ReputationBadge'
import {
  getLevel, getNextLevel, getProgress,
} from '@/components/users/reputationLevels'

describe('reputationLevels', () => {
  it('maps points to levels', () => {
    expect(getLevel(0).name).toBe('Newcomer')
    expect(getLevel(60).name).toBe('Member')
    expect(getLevel(99999).name).toBe('Legend')
    expect(getLevel(-5).name).toBe('Newcomer')
  })

  it('computes progress capped at 100', () => {
    expect(getProgress(25)).toBe(50)
    expect(getProgress(20000)).toBe(100)
  })

  it('finds the next level, none at or beyond the top', () => {
    expect(getNextLevel(10)?.name).toBe('Member')
    expect(getNextLevel(5000)).toBeNull()
    expect(getNextLevel(10000)).toBeNull()
    expect(getNextLevel(50000)).toBeNull()
  })
})

describe('ReputationBadge', () => {
  it('shows level name, points and progress', () => {
    render(<ReputationBadge points={1500} />)
    expect(screen.getByText('Expert')).toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
    expect(screen.getByRole('progressbar'))
      .toHaveAttribute('aria-valuenow', '33')
  })

  it('tooltip names the next level', async () => {
    render(<ReputationBadge points={10} />)
    expect(screen.getByLabelText(/40 points until Member/))
      .toBeInTheDocument()
  })

  it('tooltip says max level for the top rank', () => {
    render(<ReputationBadge points={20000} />)
    expect(screen.getByLabelText(/Max level!/)).toBeInTheDocument()
  })
})
