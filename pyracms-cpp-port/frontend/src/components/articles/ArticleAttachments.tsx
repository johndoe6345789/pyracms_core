'use client'

import { Alert, Box, List, Typography } from '@mui/material'
import { SnippetAttachButton } from '@/components/code/SnippetAttachButton'
import { SnippetAttachmentRow } from '@/components/code/SnippetAttachmentRow'
import { useArticleAttachments } from '@/hooks/useArticleAttachments'

interface Props {
  name: string
  tenantId: number | null
  canManage: boolean
}

/** Files that go with the article: a download list, plus attach/remove for
 * people who can edit it (the server decides who that is). */
export function ArticleAttachments({ name, tenantId, canManage }: Props) {
  const att = useArticleAttachments(name, tenantId)
  if (!att.items.length && !canManage) return null

  return (
    <Box sx={{ mb: 3 }} data-testid="article-attachments">
      <Typography variant="h6" component="h2" gutterBottom>
        Downloads
      </Typography>
      <List dense disablePadding>
        {att.items.map((a) => (
          <SnippetAttachmentRow
            key={a.id}
            attachment={a}
            isOwner={canManage}
            onRemove={() => att.remove(a.id)}
          />
        ))}
      </List>
      {att.error && (
        <Alert severity="error" sx={{ mt: 1 }} data-testid="attachment-error">
          {att.error}
        </Alert>
      )}
      {canManage && (
        <Box sx={{ mt: 1 }}>
          <SnippetAttachButton busy={att.busy} onFiles={att.upload} />
        </Box>
      )}
    </Box>
  )
}
