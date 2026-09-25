import { render, screen, fireEvent, act } from '@testing-library/react'
import api from '@/lib/api'
import { SnippetAttachments } from '@/components/code/SnippetAttachments'
import { asMockApi } from '../../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'delete'>(api)
beforeEach(() => {
  m.post.mockReset()
  m.delete.mockReset()
})

const attachment = {
  id: 1,
  fileUuid: 'u1',
  filename: 'enable1.txt',
  mimetype: 'text/plain',
  size: 2048,
}

it('renders nothing for a visitor when there are no attachments', () => {
  const { container } = render(
    <SnippetAttachments
      snippetId="7"
      tenantId={9}
      attachments={[]}
      isOwner={false}
      onChanged={jest.fn()}
    />,
  )
  expect(container).toBeEmptyDOMElement()
})

it('lists attachments with a download link and size', () => {
  render(
    <SnippetAttachments
      snippetId="7"
      tenantId={9}
      attachments={[attachment]}
      isOwner={false}
      onChanged={jest.fn()}
    />,
  )
  const link = screen.getByText('enable1.txt').closest('a')
  expect(link).toHaveAttribute('href', expect.stringContaining('/u1'))
  expect(screen.getByText('2 KB')).toBeInTheDocument()
  expect(screen.queryByTestId('remove-attachment-1')).toBeNull()
})

it('lets the owner attach and remove a file', async () => {
  const onChanged = jest.fn()
  render(
    <SnippetAttachments
      snippetId="7"
      tenantId={9}
      attachments={[attachment]}
      isOwner
      onChanged={onChanged}
    />,
  )
  const files = [new File(['x'], 'input.txt')] as unknown as FileList
  m.post
    .mockResolvedValueOnce({ data: { uuid: 'u2' } })
    .mockResolvedValueOnce({ data: {} })
  await act(async () => {
    fireEvent.change(screen.getByTestId('attach-file-input'), {
      target: { files },
    })
  })
  m.delete.mockResolvedValue({ data: {} })
  await act(async () => {
    fireEvent.click(screen.getByTestId('remove-attachment-1'))
  })
  expect(m.delete).toHaveBeenCalledWith('/api/snippets/7/attachments/1')
})
