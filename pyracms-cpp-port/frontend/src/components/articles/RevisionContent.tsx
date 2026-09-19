import { Paper } from '@mui/material'

/** Caller MUST sanitize `html` (DOMPurify) before passing it here. */
export function RevisionContent({ html }: { html: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
      <div
        data-testid="revision-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Paper>
  )
}
