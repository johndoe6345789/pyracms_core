'use client'

import { useEffect, useState } from 'react'
import { Box, TextField } from '@mui/material'
import type { ArticleEditorState } from '@/hooks/useArticleEditor'
import type { EditorMode } from './EditorModeSelector'
import { defaultModeFor } from './editorModes'
import { ArticleEditorToolbar } from './ArticleEditorToolbar'
import { ArticleEditorContent } from './ArticleEditorContent'
import { ArticleTagEditor } from './ArticleTagEditor'

interface ArticleEditorFormProps {
  editor: ArticleEditorState
  contentPlaceholder?: string
  /** Where an unsaved draft is kept; leave out when editing */
  draftKey?: string
  onSummaryChange?: (value: string) => void
}

export function ArticleEditorForm({
  editor,
  draftKey,
  onSummaryChange,
}: ArticleEditorFormProps) {
  const [mode, setMode] = useState<EditorMode>(defaultModeFor(editor.renderer))
  // Changing the renderer picks the editor that suits it
  useEffect(() => setMode(defaultModeFor(editor.renderer)), [editor.renderer])

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
      data-testid="article-editor-form"
    >
      <TextField
        label="Title"
        value={editor.title}
        onChange={(e) => editor.setTitle(e.target.value)}
        fullWidth
        placeholder="Enter a title..."
        data-testid="article-title-input"
      />
      <ArticleEditorToolbar
        editor={editor}
        mode={mode}
        onModeChange={setMode}
      />
      <ArticleEditorContent mode={mode} editor={editor} draftKey={draftKey} />
      <ArticleTagEditor
        tagsInput={editor.tagsInput}
        setTagsInput={editor.setTagsInput}
        tags={editor.parsedTags}
      />
      <TextField
        label="Revision Summary"
        value={editor.summary}
        onChange={(e) => {
          editor.setSummary(e.target.value)
          onSummaryChange?.(e.target.value)
        }}
        fullWidth
        placeholder="Describe your changes..."
        data-testid="summary-input"
      />
    </Box>
  )
}
