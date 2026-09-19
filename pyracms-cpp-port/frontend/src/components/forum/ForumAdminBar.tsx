'use client'

import { Box, Button } from '@mui/material'
import type { ForumAdminState } from '@/hooks/useForumAdmin'
import type { Forum } from '@/hooks/useForumCategories'

export function ForumAdminBar({
  forum,
  admin,
}: {
  forum: Forum
  admin: ForumAdminState
}) {
  const f = {
    kind: 'forum',
    id: forum.id,
    name: forum.name,
    description: forum.description,
  } as const
  return (
    <Box
      sx={{ display: 'flex', gap: 1, px: 3, pb: 1 }}
      data-testid={`forum-admin-${forum.id}`}
    >
      <Button
        size="small"
        data-testid={`edit-forum-${forum.id}`}
        onClick={() => admin.open({ ...f, mode: 'edit' })}
      >
        Edit
      </Button>
      <Button
        size="small"
        color="error"
        data-testid={`delete-forum-${forum.id}`}
        onClick={() => admin.open({ ...f, mode: 'delete' })}
      >
        Delete
      </Button>
    </Box>
  )
}
