import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ArticleSchedule from '@/components/articles/ArticleSchedule'

const schedule = jest.fn().mockResolvedValue(undefined)
const clear = jest.fn()
const mount = (status: string, scheduledAt?: string) =>
  render(
    <ArticleSchedule
      status={status}
      busy={false}
      {...(scheduledAt ? { scheduledAt } : {})}
      onSchedule={schedule}
      onClear={clear}
    />,
  )

describe('ArticleSchedule', () => {
  beforeEach(() => {
    schedule.mockClear()
    clear.mockClear()
  })

  it('disables the button until a time is chosen, then schedules', () => {
    mount('draft')
    const btn = screen.getByTestId('article-schedule-btn')
    expect(btn).toBeDisabled()
    fireEvent.change(
      screen.getByTestId('article-schedule-input').querySelector('input')!,
      { target: { value: '2030-01-02T03:04' } },
    )
    fireEvent.click(btn)
    expect(schedule).toHaveBeenCalledWith('2030-01-02T03:04')
  })
  it('shows the scheduled time and clears it', async () => {
    mount('scheduled', '2030-01-02T03:04:00Z')
    expect(screen.getByTestId('article-scheduled-at')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('article-schedule-clear'))
    await waitFor(() => expect(clear).toHaveBeenCalled())
  })
  it('hides clear when not scheduled', () => {
    mount('published')
    expect(screen.queryByTestId('article-schedule-clear')).toBeNull()
  })
})
