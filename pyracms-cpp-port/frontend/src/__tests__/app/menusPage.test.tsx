import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '@/app/site/[slug]/(admin)/admin/menus/page'
import { menuRow } from '../helpers/menuRow'

const editor = {
  currentItems: [menuRow({ id: 5, name: 'Home', route: '/' })],
  error: '',
  busy: false,
  save: jest.fn().mockResolvedValue(true),
  remove: jest.fn(),
  move: jest.fn(),
}
jest.mock('next/navigation', () => ({ useParams: () => ({ slug: 's' }) }))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/useMenuEditor', () => ({ useMenuEditor: () => editor }))
jest.mock('@/hooks/admin/useMenuTargets', () => ({
  useMenuTargets: () => [],
}))

it('adds a folder through the dialog', async () => {
  render(<Page />)
  fireEvent.click(screen.getByTestId('add-folder-btn'))
  fireEvent.click(screen.getByTestId('kind-folder'))
  fireEvent.change(screen.getByTestId('menu-name-input'), {
    target: { value: 'Dir' },
  })
  fireEvent.click(screen.getByTestId('menu-save-btn'))
  await waitFor(() =>
    expect(editor.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Dir', kind: 'folder' }),
      undefined,
    ),
  )
  await waitFor(() => expect(screen.queryByTestId('menu-save-btn')).toBeNull())
})

it('edits and deletes an entry, asking before deleting', () => {
  render(<Page />)
  fireEvent.click(screen.getByTestId('edit-5'))
  expect(screen.getByDisplayValue('Home')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Cancel'))
  fireEvent.click(screen.getByTestId('delete-5'))
  expect(screen.getByText(/Delete "Home"/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(editor.remove).toHaveBeenCalledWith(5)
})
