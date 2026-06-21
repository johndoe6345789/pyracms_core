'use client'

import { useState } from 'react'
import { Box, TextField, MenuItem } from '@mui/material'
import {
  RENDERERS, type ArticleEditorState,
} from '@/hooks/useArticleEditor'
import {
  EditorModeSelector, type EditorMode,
} from './EditorModeSelector'
import {
  ArticleEditorContent,
} from './ArticleEditorContent'
import { ArticleTagEditor } from './ArticleTagEditor'

interface ArticleEditorFormProps {
  editor: ArticleEditorState
  contentPlaceholder?: string
  onSummaryChange?: (value: string) => void
}

export function ArticleEditorForm({
  editor, onSummaryChange,
}: ArticleEditorFormProps) {
  const [mode, setMode] =
    useState<EditorMode>('monaco')

  return (
    <Box component="form" sx={{
      display: 'flex',
      flexDirection: 'column', gap: 3,
    }} data-testid="article-editor-form">
      <TextField
        label="Title" value={editor.title}
        onChange={(e) =>
          editor.setTitle(e.target.value)}
        fullWidth placeholder="Enter a title..."
        data-testid="article-title-input" />
      <Box sx={{
        display: 'flex', gap: 2,
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <TextField
          label="Renderer" select
          value={editor.renderer}
          onChange={(e) =>
            editor.setRenderer(e.target.value)}
          sx={{ maxWidth: 200 }}
          data-testid="renderer-select">
          {RENDERERS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>))}
        </TextField>
        <EditorModeSelector
          mode={mode}
          onModeChange={setMode} />
      </Box>
      <ArticleEditorContent
        mode={mode} editor={editor} />
      <ArticleTagEditor
        tagsInput={editor.tagsInput}
        setTagsInput={editor.setTagsInput}
        tags={editor.parsedTags} />
      <TextField
        label="Revision Summary"
        value={editor.summary}
        onChange={(e) => {
          editor.setSummary(e.target.value)
          onSummaryChange?.(e.target.value)
        }}
        fullWidth
        placeholder="Describe your changes..."
        data-testid="summary-input" />
    </Box>
  )
}
