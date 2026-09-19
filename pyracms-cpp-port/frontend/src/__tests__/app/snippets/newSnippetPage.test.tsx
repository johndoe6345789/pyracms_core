import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import NewSnippetPage from '@/app/site/[slug]/(tenant)/snippets/new/page'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's' }),
  useRouter: () => ({ push }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { post: jest.fn() },
}))
jest.mock('@monaco-editor/react', () => ({
  __esModule: true, default: () => null,
}))

it('renders the new snippet page and navigates on cancel', () => {
  render(<NewSnippetPage />)
  expect(screen.getByTestId('new-snippet-page')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('cancel-btn'))
  expect(push).toHaveBeenCalledWith('/site/s/snippets')
})

it('opens the saved snippet after saving', async () => {
  (api.post as jest.Mock).mockResolvedValue({ data: { id: 7 } })
  render(<NewSnippetPage />)
  fireEvent.change(screen.getByTestId('snippet-title-input')
    .querySelector('input')!, { target: { value: 'Hi' } })
  fireEvent.click(screen.getByTestId('save-btn'))
  await waitFor(() => expect(push).toHaveBeenCalledWith(
    '/site/s/snippets/7'))
})
