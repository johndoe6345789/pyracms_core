'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { useForumCategories } from '@/hooks/useForumCategories'
import { useForumAdmin } from '@/hooks/useForumAdmin'
import { useTenantNav } from '@/hooks/useTenantNav'
import { useTenantId } from '@/hooks/useTenantId'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import { ForumSearchPanel } from '@/components/forum/ForumSearchPanel'
import { ForumAdminDialog } from '@/components/forum/ForumAdminDialog'
import {
  ForumLoading, ForumError, ForumEmpty,
} from '@/components/forum/ForumStatus'

export default function ForumPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const { categories, loading, error, refresh } = useForumCategories(tenantId)
  const { canAdmin } = useTenantNav()
  const admin = useForumAdmin(tenantId, refresh)
  const forumNames = categories.flatMap((c) => c.forums.map((f) => f.name))
  const busy = tenantLoading || loading
  const addCategory = () => admin.open({ kind: 'category', mode: 'create' })
  const addBtn = canAdmin && (
    <Button variant="contained" onClick={addCategory}
      data-testid="add-category-btn" sx={{ mt: 2 }}>
      Add category
    </Button>
  )

  let body
  if (busy) {
    body = <ForumLoading />
  } else if (error || !tenantId) {
    body = <ForumError message={error || 'Site not found.'} />
  } else if (categories.length === 0) {
    body = canAdmin ? (
      <ForumEmpty title="No categories yet"
        hint="Create the first category to start organising forums.">
        {addBtn}
      </ForumEmpty>
    ) : (
      <ForumEmpty
        title="No forums yet"
        hint="An administrator has not created any forums for this site."
      />
    )
  } else {
    body = categories.map((category) => (
      <CategoryAccordion key={category.id} category={category} slug={slug}
        admin={canAdmin ? admin : undefined} />
    ))
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="forum-page">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Forum
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join discussions, ask questions, and share knowledge with the
          community.
        </Typography>
        {categories.length > 0 && addBtn}
      </Box>
      {tenantId && (
        <Box sx={{ mb: 3 }}>
          <ForumSearchPanel slug={slug} tenantId={tenantId}
            forums={forumNames} />
        </Box>
      )}
      {body}
      <ForumAdminDialog s={admin} />
    </Container>
  )
}
