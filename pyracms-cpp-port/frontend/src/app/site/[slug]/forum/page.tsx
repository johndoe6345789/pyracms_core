'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useForumCategories } from '@/hooks/useForumCategories'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'

export default function ForumPage() {
  const params = useParams()
  const slug = params.slug as string
  const { categories } = useForumCategories()

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>Forum</Typography>
        <Typography variant="body1" color="text.secondary">
          Join discussions, ask questions, and share knowledge with the community.
        </Typography>
      </Box>
      {categories.map((category) => (
        <CategoryAccordion key={category.id} category={category} slug={slug} />
      ))}
    </Container>
  )
}
