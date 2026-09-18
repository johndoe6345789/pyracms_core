'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useForumCategories } from '@/hooks/useForumCategories'
import { useTenantId } from '@/hooks/useTenantId'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import {
  ForumLoading, ForumError, ForumEmpty,
} from '@/components/forum/ForumStatus'

export default function ForumPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const { categories, loading, error } = useForumCategories(tenantId)
  const busy = tenantLoading || loading

  let body
  if (busy) {
    body = <ForumLoading />
  } else if (error || !tenantId) {
    body = <ForumError message={error || 'Site not found.'} />
  } else if (categories.length === 0) {
    body = (
      <ForumEmpty
        title="No forums yet"
        hint="An administrator has not created any forums for this site."
      />
    )
  } else {
    body = categories.map((category) => (
      <CategoryAccordion key={category.id} category={category} slug={slug} />
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
      </Box>
      {body}
    </Container>
  )
}
