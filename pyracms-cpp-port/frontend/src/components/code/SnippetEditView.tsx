'use client'

import { SnippetEditorForm } from './SnippetEditorForm'
import { useSnippetEditor } from '@/hooks/useSnippetEditor'
import type { Snippet } from '@/lib/snippets'

interface Props {
  snippet: Snippet
  tenantId: number | null
  onDone: (saved: boolean) => void
}

export function SnippetEditView({ snippet, tenantId, onDone }: Props) {
  const editor = useSnippetEditor(tenantId, snippet)
  return (
    <SnippetEditorForm
      editor={editor}
      saveLabel="Save Changes"
      onSaved={() => onDone(true)}
      onCancel={() => onDone(false)}
    />
  )
}
