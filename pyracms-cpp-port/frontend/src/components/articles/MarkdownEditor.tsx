'use client'

import { useState } from 'react'
import { Box, TextField } from '@mui/material'
import { EditorToolbar } from './EditorToolbar'
import { EditorViewToggle, type ViewMode } from './EditorViewToggle'
import { EditorPreviewPane } from './EditorPreviewPane'
import { MarkdownPreview } from './MarkdownPreview'
import { getMarkdownActions } from './toolbarActions'
import { useTextInsert } from './useTextInsert'
import { fieldSx, frameSx } from './markdownStyles'

interface MarkdownEditorProps {
  value: string
  onChange: (v: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { ref, insert } = useTextInsert(value, onChange)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const showEd = viewMode !== 'preview'
  const showPv = viewMode !== 'edit'

  return (
    <section aria-label="Markdown editor">
      <Box sx={frameSx}>
        <EditorToolbar actions={getMarkdownActions()} onAction={insert}>
          <EditorViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </EditorToolbar>
        <Box sx={{ display: 'flex', minHeight: 400 }}>
          {showEd && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                inputRef={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                fullWidth
                multiline
                minRows={16}
                maxRows={40}
                placeholder="Write Markdown..."
                data-testid="markdown-textarea"
                sx={fieldSx}
              />
            </Box>
          )}
          {showPv && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                borderLeft: showEd ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              <EditorPreviewPane>
                <MarkdownPreview value={value} />
              </EditorPreviewPane>
            </Box>
          )}
        </Box>
      </Box>
    </section>
  )
}
