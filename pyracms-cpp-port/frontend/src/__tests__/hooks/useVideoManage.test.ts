import { act, renderHook } from '@testing-library/react'
import { useVideoManage } from '@/hooks/useVideoManage'
import { makeVideo } from '../helpers/videoFixture'

const setup = (video = makeVideo()) => {
  const update = jest.fn().mockResolvedValue(undefined)
  const remove = jest.fn().mockResolvedValue({})
  const deleted = jest.fn()
  const h = renderHook(() => useVideoManage(video, update, remove, deleted))
  return { r: h.result, update, remove, deleted }
}

it('edits the title, description and visibility', async () => {
  const { r, update } = setup()
  act(() => r.current.open('edit'))
  expect(r.current.dialog).toBe('edit')
  expect(r.current.form.title).toBe('Cat video')
  act(() => r.current.set({ visibility: 'unlisted' }))
  await act(() => r.current.save())
  expect(update).toHaveBeenCalledWith({
    title: 'Cat video',
    description: 'A cat',
    visibility: 'unlisted',
  })
  expect(r.current.dialog).toBe('')
})

it('keeps the dialog open with the error when saving fails', async () => {
  const { r, update } = setup()
  update.mockRejectedValue({ response: { data: { error: 'Too long' } } })
  act(() => r.current.open('edit'))
  await act(() => r.current.save())
  expect(r.current.error).toBe('Too long')
  expect(r.current.dialog).toBe('edit')
  act(() => r.current.close())
  expect(r.current.dialog).toBe('')
})

it('deletes after confirming', async () => {
  const { r, remove, deleted } = setup()
  act(() => r.current.open('delete'))
  await act(() => r.current.confirmDelete())
  expect(remove).toHaveBeenCalled()
  expect(deleted).toHaveBeenCalled()
  remove.mockRejectedValue({ response: {} })
  await act(() => r.current.confirmDelete())
  expect(r.current.error).toBe('Could not delete the video')
  expect(deleted).toHaveBeenCalledTimes(1)
})

it('opens with an empty form before the video loads', () => {
  const h = renderHook(() =>
    useVideoManage(null, jest.fn(), jest.fn(), jest.fn()),
  )
  act(() => h.result.current.open('edit'))
  expect(h.result.current.form.title).toBe('')
})
