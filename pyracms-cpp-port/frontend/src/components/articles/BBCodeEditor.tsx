'use client'

import { useCallback, useRef } from 'react'
import { Box, Paper, TextField } from '@mui/material'
import { BBCodeToolbar } from './BBCodeToolbar'
import { renderBBCode } from './bbcodeRenderer'
import {
  EditorPreviewPane, EmptyPreview,
  HtmlPreviewContent,
} from './EditorPreviewPane'

interface BBCodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export function BBCodeEditor({
  value, onChange,
}: BBCodeEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insertTag = useCallback((
    tag: string, hasAttr?: boolean,
    attrPrompt?: string,
  ) => {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = value.substring(start, end)
    let open: string
    const close = `[/${tag}]`
    if (hasAttr && attrPrompt) {
      const attr = window.prompt(attrPrompt)
      if (attr === null) return
      open = `[${tag}=${attr}]`
    } else {
      open = `[${tag}]`
    }
    if (tag === 'list') {
      const items = sel
        ? sel.split('\n')
          .map((l) => `[*]${l}`).join('\n')
        : '[*]item'
      onChange(value.substring(0, start)
        + `${open}\n${items}\n${close}`
        + value.substring(end))
      return
    }
    const inner = sel || tag
    onChange(value.substring(0, start)
      + `${open}${inner}${close}`
      + value.substring(end))
    setTimeout(() => {
      ta.focus()
      const pos = start + open.length
        + (sel ? sel.length : tag.length)
      ta.setSelectionRange(pos, pos)
    }, 0)
  }, [value, onChange])

  return (
    <section aria-label="BBCode editor">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column', gap: 2,
      }}>
        <Box sx={{
          border: 1, borderColor: 'divider',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <BBCodeToolbar onInsertTag={insertTag} />
          <TextField
            inputRef={ref} value={value}
            onChange={(e) =>
              onChange(e.target.value)}
            fullWidth multiline
            minRows={12} maxRows={30}
            placeholder="Write BBCode here..."
            data-testid="bbcode-textarea"
            sx={{
              '& .MuiOutlinedInput-notchedOutline':
                { border: 'none' },
            }} />
        </Box>
        <Paper variant="outlined" sx={{
          p: 3, minHeight: 200,
          borderColor: 'divider',
        }}>
          <EditorPreviewPane>
            {value ? (
              <HtmlPreviewContent
                sanitizedHtml={
                  renderBBCode(value)}
                sx={{ lineHeight: 1.8 }} />
            ) : <EmptyPreview />}
          </EditorPreviewPane>
        </Paper>
      </Box>
    </section>
  )
}
