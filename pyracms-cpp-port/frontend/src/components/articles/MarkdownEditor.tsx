'use client'

import { useCallback, useRef, useState } from 'react'
import { Box, TextField } from '@mui/material'
import { EditorToolbar } from './EditorToolbar'
import {
  EditorViewToggle, type ViewMode,
} from './EditorViewToggle'
import { EditorPreviewPane } from './EditorPreviewPane'
import { MarkdownPreview } from './MarkdownPreview'
import { getMarkdownActions } from './toolbarActions'

interface MarkdownEditorProps {
  value: string; onChange: (v: string) => void
}
const MONO_FONT = '"Fira Code",'
  + '"JetBrains Mono", monospace'

export function MarkdownEditor({
  value, onChange,
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] =
    useState<ViewMode>('split')

  const insert = useCallback((
    pre: string, suf: string,
  ) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const sel = value.substring(s, e)
    const inner = sel || 'text'
    onChange(value.substring(0, s)
      + `${pre}${inner}${suf}`
      + value.substring(e))
    setTimeout(() => {
      ta.focus()
      const pos = s + pre.length
        + (sel ? sel.length : 4)
      ta.setSelectionRange(pos, pos)
    }, 0)
  }, [value, onChange])

  const showEd = viewMode !== 'preview'
  const showPv = viewMode !== 'edit'

  return (
    <section aria-label="Markdown editor">
      <Box sx={{
        border: 1, borderColor: 'divider',
        borderRadius: 1, overflow: 'hidden',
      }}>
        <EditorToolbar
          actions={getMarkdownActions()}
          onAction={insert}>
          <EditorViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode} />
        </EditorToolbar>
        <Box sx={{
          display: 'flex', minHeight: 400,
        }}>
          {showEd && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                inputRef={ref} value={value}
                onChange={(e) =>
                  onChange(e.target.value)}
                fullWidth multiline
                minRows={16} maxRows={40}
                placeholder="Write Markdown..."
                data-testid="markdown-textarea"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline':
                    { border: 'none' },
                  '& .MuiInputBase-input': {
                    fontFamily: MONO_FONT,
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                  },
                }} />
            </Box>)}
          {showPv && (
            <Box sx={{
              flex: 1, minWidth: 0,
              borderLeft: showEd ? 1 : 0,
              borderColor: 'divider',
            }}>
              <EditorPreviewPane>
                <MarkdownPreview value={value} />
              </EditorPreviewPane>
            </Box>)}
        </Box>
      </Box>
    </section>
  )
}
