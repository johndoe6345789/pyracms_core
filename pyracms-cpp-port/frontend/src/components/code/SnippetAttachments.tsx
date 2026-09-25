'use client'

import { Box, Typography, List, Alert } from '@mui/material'
import { SnippetAttachButton } from './SnippetAttachButton'
import { SnippetAttachmentRow } from './SnippetAttachmentRow'
import { useSnippetAttachments } from '@/hooks/useSnippetAttachments'
import type { SnippetAttachment } from '@/lib/snippets'

interface Props {
  snippetId: string
  tenantId: number | null
  attachments: SnippetAttachment[]
  isOwner: boolean
  onChanged: () => void
}

/** Files the snippet's code expects (e.g. an input.txt a challenge reads
 * with open()): a plain download list, plus upload/remove for the owner.
 * Not wired into Run -- the sandbox has no file-passing mechanism, so an
 * attachment is something to download and run against locally for now. */
export function SnippetAttachments({
  snippetId,
  tenantId,
  attachments,
  isOwner,
  onChanged,
}: Props) {
  const att = useSnippetAttachments(snippetId, tenantId, onChanged)

  if (!attachments.length && !isOwner) return null

  return (
    <Box sx={{ mb: 3 }} data-testid="snippet-attachments">
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Attachments
      </Typography>
      {attachments.length > 0 && (
        <List dense disablePadding>
          {attachments.map((a) => (
            <SnippetAttachmentRow
              key={a.id}
              attachment={a}
              isOwner={isOwner}
              onRemove={() => att.remove(a.id)}
            />
          ))}
        </List>
      )}
      {att.error && (
        <Alert severity="error" sx={{ mt: 1 }} data-testid="attachment-error">
          {att.error}
        </Alert>
      )}
      {isOwner && (
        <Box sx={{ mt: 1 }}>
          <SnippetAttachButton busy={att.busy} onFiles={att.upload} />
        </Box>
      )}
    </Box>
  )
}
