import { render, screen, fireEvent } from '@testing-library/react'
import NewSnippetPage from '@/app/site/[slug]/(tenant)/snippets/new/page'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's' }),
  useRouter: () => ({ push }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
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
