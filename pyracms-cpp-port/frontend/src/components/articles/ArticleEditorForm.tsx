'use client'

import { useState } from 'react'
import { Box, TextField, MenuItem } from '@mui/material'
import { ArticleTagChips } from './ArticleTagChips'
import {
  RENDERERS, type ArticleEditorState,
} from '@/hooks/useArticleEditor'
import {
  EditorModeSelector, type EditorMode,
} from './EditorModeSelector'
import {
  ArticleEditorContent,
} from './ArticleEditorContent'

interface ArticleEditorFormProps {
  editor: ArticleEditorState
  contentPlaceholder?: string
}

export function ArticleEditorForm({
  editor,
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
      <TextField
        label="Tags (comma-separated)"
        value={editor.tagsInput}
        onChange={(e) =>
          editor.setTagsInput(e.target.value)}
        fullWidth
        helperText="Separate tags with commas"
        data-testid="tags-input" />
      {editor.parsedTags.length > 0 && (
        <ArticleTagChips
          tags={editor.parsedTags}
          color="primary" />)}
      <TextField
        label="Revision Summary"
        value={editor.summary}
        onChange={(e) =>
          editor.setSummary(e.target.value)}
        fullWidth
        placeholder="Describe your changes..."
        data-testid="summary-input" />
    </Box>
  )
}
