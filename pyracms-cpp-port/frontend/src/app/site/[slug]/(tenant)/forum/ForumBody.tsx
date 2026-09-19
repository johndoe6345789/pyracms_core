'use client'

import { Button } from '@mui/material'
import type { ForumCategory } from '@/hooks/useForumCategories'
import type { ForumAdminState } from '@/hooks/useForumAdmin'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import {
  ForumLoading,
  ForumError,
  ForumEmpty,
} from '@/components/forum/ForumStatus'

interface Props {
  busy: boolean
  error: string | null
  tenantId: number | null
  categories: ForumCategory[]
  canAdmin: boolean
  admin: ForumAdminState
  slug: string
  addBtn: React.ReactNode
}

export default function ForumBody(p: Props) {
  const { categories, canAdmin, admin } = p
  if (p.busy) return <ForumLoading />
  if (p.error || !p.tenantId) {
    return <ForumError message={p.error || 'Site not found.'} />
  }
  if (categories.length === 0) {
    return canAdmin ? (
      <ForumEmpty
        title="No categories yet"
        hint="Create the first category to start organising forums."
      >
        {p.addBtn}
      </ForumEmpty>
    ) : (
      <ForumEmpty
        title="No forums yet"
        hint="An administrator has not created any forums for this site."
      />
    )
  }
  return categories.map((category) => (
    <CategoryAccordion
      key={category.id}
      category={category}
      slug={p.slug}
      admin={canAdmin ? admin : undefined}
    />
  ))
}

export function AddCategoryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      data-testid="add-category-btn"
      sx={{ mt: 2 }}
    >
      Add category
    </Button>
  )
}
