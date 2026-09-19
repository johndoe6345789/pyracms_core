import { render, screen, fireEvent } from '@testing-library/react'
import { CreateThreadPage } from '../../helpers/pages/CreateThreadPage'

let query = 'forumId=2'

let authed = true

const submit = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's' }),
  useSearchParams: () => new URLSearchParams(query),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))

jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ isAuthenticated: authed }),
}))

jest.mock('@/hooks/useCreateThread', () => ({
  useCreateThread: () => ({
    title: '',
    setTitle: jest.fn(),
    description: '',
    setDescription: jest.fn(),
    content: '',
    setContent: jest.fn(),
    loading: false,
    error: '',
    handleSubmit: submit,
  }),
}))

beforeEach(() => {
  query = 'forumId=2'
  authed = true
})

it('renders the form and submits', () => {
  render(<CreateThreadPage />)
  fireEvent.click(screen.getByTestId('create-thread-submit'))
  expect(submit).toHaveBeenCalled()
  expect(screen.getByTestId('create-thread-cancel')).toHaveAttribute(
    'href',
    '/site/s/forum/2',
  )
})
