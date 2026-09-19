import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SnippetEditView } from '@/components/code/SnippetEditView'
import api from '@/lib/api'
import type { Snippet } from '@/lib/snippets'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { put: jest.fn() },
}))
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
}))

const snippet = {
  id: '4',
  title: 'T',
  code: 'x',
  language: 'python',
  visibility: 'public',
} as unknown as Snippet

describe('SnippetEditView', () => {
  it('reports a save', async () => {
    ;(api.put as jest.Mock).mockResolvedValue({})
    const onDone = jest.fn()
    render(<SnippetEditView snippet={snippet} tenantId={1} onDone={onDone} />)
    fireEvent.click(screen.getByTestId('save-btn'))
    await waitFor(() => expect(onDone).toHaveBeenCalledWith(true))
  })

  it('reports a cancel', () => {
    const onDone = jest.fn()
    render(<SnippetEditView snippet={snippet} tenantId={1} onDone={onDone} />)
    fireEvent.click(screen.getByTestId('cancel-btn'))
    expect(onDone).toHaveBeenCalledWith(false)
  })
})
