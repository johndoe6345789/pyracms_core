import { renderHook } from '@testing-library/react'
import { useArticleEditor } from '@/hooks/useArticleEditor'

export const monaco = {
  MonacoEditorComponent: (p: {
    value: string
    onChange: (v: string) => void
  }) => (
    <button data-testid="monaco" onClick={() => p.onChange('M')}>
      {p.value}
    </button>
  ),
}
export const rich = { RichTextEditor: () => <i data-testid="rich" /> }
export const bb = { BBCodeEditor: () => <i data-testid="bb" /> }
export const md = { MarkdownEditor: () => <i data-testid="md" /> }

export const editor = () => renderHook(() => useArticleEditor({ content: 'c' }))
