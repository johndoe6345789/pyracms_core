'use client'

import { Box, TextField, MenuItem } from '@mui/material'
import { RENDERERS, type ArticleEditorState } from '@/hooks/useArticleEditor'
import { EditorModeSelector, type EditorMode } from './EditorModeSelector'

interface Props {
  editor: ArticleEditorState
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

export function ArticleEditorToolbar({ editor, mode, onModeChange }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        label="Renderer"
        select
        value={editor.renderer}
        onChange={(e) => editor.setRenderer(e.target.value)}
        sx={{ maxWidth: 200 }}
        data-testid="renderer-select"
      >
        {RENDERERS.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </TextField>
      <EditorModeSelector mode={mode} onModeChange={onModeChange} />
    </Box>
  )
}
