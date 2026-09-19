'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useForumCategories } from '@/hooks/useForumCategories'
import { useForumAdmin } from '@/hooks/useForumAdmin'
import { useTenantNav } from '@/hooks/useTenantNav'
import { useTenantId } from '@/hooks/useTenantId'
import { ForumSearchPanel } from '@/components/forum/ForumSearchPanel'
import { ForumAdminDialog } from '@/components/forum/ForumAdminDialog'
import ForumBody, { AddCategoryButton } from './ForumBody'

export default function ForumPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const { categories, loading, error, refresh } = useForumCategories(tenantId)
  const { canAdmin } = useTenantNav()
  const admin = useForumAdmin(tenantId, refresh)
  const forumNames = categories.flatMap((c) => c.forums.map((f) => f.name))
  const addCategory = () => admin.open({ kind: 'category', mode: 'create' })
  const addBtn = canAdmin && <AddCategoryButton onClick={addCategory} />

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
          <ForumSearchPanel
            slug={slug}
            tenantId={tenantId}
            forums={forumNames}
          />
        </Box>
      )}
      <ForumBody
        busy={tenantLoading || loading}
        error={error}
        tenantId={tenantId}
        categories={categories}
        canAdmin={canAdmin}
        admin={admin}
        slug={slug}
        addBtn={addBtn}
      />
      <ForumAdminDialog s={admin} />
    </Container>
  )
}
