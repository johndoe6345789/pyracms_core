'use client'

import { TextField } from '@mui/material'
import type { SnippetEditor } from '@/hooks/useSnippetEditor'

/** A note for the history: what this save changed (optional). */
export function SnippetSummaryField({ editor: e }: { editor: SnippetEditor }) {
  return (
    <TextField
      label="What changed? (optional)"
      value={e.summary}
      onChange={(ev) => e.setSummary(ev.target.value)}
      fullWidth
      size="small"
      slotProps={{ htmlInput: { maxLength: 500 } }}
      data-testid="snippet-summary-input"
    />
  )
}
