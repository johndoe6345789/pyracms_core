import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { MentionAutocomplete } from '@/components/common/MentionAutocomplete'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

function Host({ onSelect }: { onSelect: (u: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  return (
    <>
      <textarea data-testid="ta" ref={ref} />
      <MentionAutocomplete inputRef={ref} onSelect={onSelect} />
    </>
  )
}

const type = (v: string) => {
  const ta = screen.getByTestId('ta') as HTMLTextAreaElement
  ta.value = v
  ta.setSelectionRange(v.length, v.length)
  fireEvent.input(ta)
}

describe('MentionAutocomplete', () => {
  it('suggests users after @ and selects one', async () => {
    jest.useFakeTimers()
    get.mockResolvedValue({ data: [{ id: 1, username: 'alice' }] })
    const onSelect = jest.fn()
    render(<Host onSelect={onSelect} />)
    type('hi @al')
    await act(async () => {
      jest.advanceTimersByTime(250)
    })
    jest.useRealTimers()
    fireEvent.click(await screen.findByTestId('mention-item-1'))
    expect(onSelect).toHaveBeenCalledWith('alice')
    expect(screen.queryByTestId('mention-item-1')).toBeNull()
    expect(get.mock.calls[0][0]).toContain('search=al')
  })

  it('shows nothing without a mention token', () => {
    render(<Host onSelect={jest.fn()} />)
    type('plain text')
    expect(screen.queryByText('Mention user')).toBeNull()
    expect(get).not.toHaveBeenCalled()
  })

  it('clears on errors and non-array payloads', async () => {
    get
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValueOnce({ data: {} })
    render(<Host onSelect={jest.fn()} />)
    type('@a')
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    type('@ab')
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(screen.queryByText('Mention user')).toBeNull()
  })

  it('resets when the token disappears', async () => {
    get.mockResolvedValue({ data: [{ id: 2, username: 'bob' }] })
    render(<Host onSelect={jest.fn()} />)
    type('@b')
    await screen.findByTestId('mention-item-2')
    type('done')
    await waitFor(() =>
      expect(screen.queryByTestId('mention-item-2')).toBeNull(),
    )
  })
})
