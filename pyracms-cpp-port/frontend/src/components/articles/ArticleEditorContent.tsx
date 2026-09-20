'use client'

import type { ArticleEditorState } from '@/hooks/useArticleEditor'
import type { EditorMode } from './EditorModeSelector'
import { MonacoEditorComponent } from './MonacoEditor'
import { RichTextEditor } from './RichTextEditor'
import { BBCodeEditor } from './BBCodeEditor'
import { MarkdownEditor } from './MarkdownEditor'
import { ViewModeToggle } from './ViewModeToggle'
import { ContentPreview } from './ContentPreview'

interface ArticleEditorContentProps {
  mode: EditorMode
  editor: ArticleEditorState
  /** Where an unsaved draft is kept; none = no autosave (editing) */
  draftKey?: string | undefined
}

export function ArticleEditorContent({
  mode,
  editor,
  draftKey,
}: ArticleEditorContentProps) {
  if (mode === 'monaco') {
    return (
      <>
        <ViewModeToggle
          viewMode={editor.viewMode}
          setViewMode={editor.setViewMode}
        />
        {editor.viewMode === 'edit' ? (
          <MonacoEditorComponent
            value={editor.content}
            onChange={editor.setContent}
            language={editor.renderer}
            autoSaveKey={draftKey}
          />
        ) : (
          <ContentPreview content={editor.content} renderer={editor.renderer} />
        )}
      </>
    )
  }
  if (mode === 'wysiwyg') {
    return (
      <RichTextEditor value={editor.content} onChange={editor.setContent} />
    )
  }
  if (mode === 'bbcode') {
    return <BBCodeEditor value={editor.content} onChange={editor.setContent} />
  }
  if (mode === 'markdown') {
    return (
      <MarkdownEditor value={editor.content} onChange={editor.setContent} />
    )
  }
  return null
}
