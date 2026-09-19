import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GalleryManageDialogs, { type ManageDialog }
  from '@/components/gallery/GalleryManageDialogs'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { put: jest.fn(), delete: jest.fn() },
}))
const m = api as unknown as Record<string, jest.Mock>
const cb = { onClose: jest.fn(), onChanged: jest.fn(), onDeleted: jest.fn() }
const mount = (open: ManageDialog) => render(
  <GalleryManageDialogs kind="albums" id="2" name="Trip" description="d"
    open={open} {...cb} />)
const input = (id: string) =>
  screen.getByTestId(id) as HTMLInputElement

describe('GalleryManageDialogs', () => {
  beforeEach(() => {
    Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
    Object.values(cb).forEach((f) => f.mockReset())
  })

  it('saves edits', async () => {
    mount('edit')
    fireEvent.change(input('gallery-edit-name'), { target: { value: 'New' } })
    fireEvent.click(screen.getByTestId('gallery-edit-save'))
    await waitFor(() => expect(cb.onChanged).toHaveBeenCalled())
    expect(m.put).toHaveBeenCalledWith('/api/gallery/albums/2',
      { displayName: 'New', description: 'd' })
  })
  it('blocks an empty title', () => {
    mount('edit')
    fireEvent.change(input('gallery-edit-name'), { target: { value: ' ' } })
    expect(screen.getByTestId('gallery-edit-save')).toBeDisabled()
  })
  it('deletes after confirmation', async () => {
    mount('delete')
    fireEvent.click(screen.getByTestId('gallery-delete-confirm'))
    await waitFor(() => expect(cb.onDeleted).toHaveBeenCalled())
    expect(m.delete).toHaveBeenCalledWith('/api/gallery/albums/2')
  })
  it('shows a failure', async () => {
    m.delete!.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    mount('delete')
    fireEvent.click(screen.getByTestId('gallery-delete-confirm'))
    expect(await screen.findByTestId('gallery-manage-error'))
      .toHaveTextContent('Forbidden')
    expect(cb.onDeleted).not.toHaveBeenCalled()
  })
})
