'use client'

import { Box, Paper, TextField } from '@mui/material'
import { BBCodeToolbar } from './BBCodeToolbar'
import { renderBBCode } from './bbcodeRenderer'
import { useBBCodeInsert } from './useBBCodeInsert'
import {
  EditorPreviewPane,
  EmptyPreview,
  HtmlPreviewContent,
} from './EditorPreviewPane'

interface BBCodeEditorProps {
  value: string
  onChange: (v: string) => void
}

const frameSx = {
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  overflow: 'hidden',
}

export function BBCodeEditor(
  { value, onChange }: BBCodeEditorProps
) {
  const { ref, insertTag } = useBBCodeInsert(value, onChange)

  return (
    <section aria-label="BBCode editor">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={frameSx}>
          <BBCodeToolbar onInsertTag={insertTag} />
          <TextField
            inputRef={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            multiline
            minRows={12}
            maxRows={30}
            placeholder="Write BBCode here..."
            data-testid="bbcode-textarea"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        </Box>
        <Paper
          variant="outlined"
          sx={{ p: 3, minHeight: 200, borderColor: 'divider' }}
        >
          <EditorPreviewPane>
            {value ? (
              <HtmlPreviewContent
                sanitizedHtml={renderBBCode(value)}
                sx={{ lineHeight: 1.8 }}
              />
            ) : (
              <EmptyPreview />
            )}
          </EditorPreviewPane>
        </Paper>
      </Box>
    </section>
  )
}
