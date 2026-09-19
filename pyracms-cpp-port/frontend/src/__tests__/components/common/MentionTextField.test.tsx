import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import api from '@/lib/api'
import { MentionTextField } from '@/components/common/MentionTextField'
import { insertMention } from '@/components/common/mentionInsert'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const m = asMockApi<'get'>(api)

function Host() {
  const [v, setV] = useState('')
  return (
    <MentionTextField
      value={v}
      onValue={setV}
      multiline
      inputProps={{ 'data-testid': 'box' }}
    />
  )
}

it('inserts the mention over the partial name', () => {
  expect(insertMention('hi @al there', 6, 'alice')).toBe('hi @alice  there')
  expect(insertMention('@b', 2, 'bob')).toBe('@bob ')
})

it('suggests users and inserts the picked one', async () => {
  jest.useFakeTimers()
  m.get.mockResolvedValue({ data: [{ id: 1, username: 'alice' }] })
  render(<Host />)
  const box = screen.getByTestId('box') as HTMLTextAreaElement
  fireEvent.change(box, { target: { value: 'hey @al', selectionStart: 7 } })
  box.setSelectionRange(7, 7)
  fireEvent.input(box)
  await act(async () => {
    jest.advanceTimersByTime(250)
  })
  fireEvent.click(await screen.findByTestId('mention-item-1'))
  expect(box.value).toBe('hey @alice ')
  jest.useRealTimers()
})
