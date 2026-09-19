'use client'

import { Box, Button } from '@mui/material'
import type { ForumAdminState } from '@/hooks/useForumAdmin'
import type { ForumCategory } from '@/hooks/useForumCategories'

export function CategoryAdminBar({
  category,
  admin,
}: {
  category: ForumCategory
  admin: ForumAdminState
}) {
  const cat = {
    kind: 'category',
    id: category.id,
    name: category.name,
  } as const
  return (
    <Box
      sx={{ display: 'flex', gap: 1, p: 1, flexWrap: 'wrap' }}
      data-testid={`category-admin-${category.id}`}
    >
      <Button
        size="small"
        data-testid={`add-forum-${category.id}`}
        onClick={() =>
          admin.open({
            kind: 'forum',
            mode: 'create',
            parentId: category.id,
          })
        }
      >
        Add forum
      </Button>
      <Button
        size="small"
        data-testid={`rename-category-${category.id}`}
        onClick={() => admin.open({ ...cat, mode: 'edit' })}
      >
        Rename category
      </Button>
      <Button
        size="small"
        color="error"
        data-testid={`delete-category-${category.id}`}
        onClick={() => admin.open({ ...cat, mode: 'delete' })}
      >
        Delete category
      </Button>
    </Box>
  )
}
