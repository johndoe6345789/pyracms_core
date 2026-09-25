import { render } from '@testing-library/react'
import { SnippetEditorForm } from '@/components/code/SnippetEditorForm'
import type { SnippetEditor } from '@/hooks/useSnippetEditor'
import api from '@/lib/api'
import { asMockApi } from './mockApi'

export const mock = asMockApi<'post'>(api)

export const editor = (over: Partial<SnippetEditor> = {}): SnippetEditor => ({
  title: 'T',
  setTitle: jest.fn(),
  code: 'x',
  setCode: jest.fn(),
  language: 'python',
  setLanguage: jest.fn(),
  summary: '',
  setSummary: jest.fn(),
  tagsInput: '',
  setTagsInput: jest.fn(),
  tags: [],
  savedId: null,
  saving: false,
  error: '',
  save: jest.fn().mockResolvedValue('7'),
  ...over,
})

export const setup = (e = editor()) => {
  const onSaved = jest.fn()
  const onCancel = jest.fn()
  render(
    <SnippetEditorForm
      editor={e}
      saveLabel="Save It"
      onSaved={onSaved}
      onCancel={onCancel}
    />,
  )
  return { e, onSaved, onCancel }
}
