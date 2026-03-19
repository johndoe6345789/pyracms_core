'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import { BackButton } from '@/components/common/BackButton'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'

export default function CreateArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const editor = useArticleEditor()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <BackButton href={`/site/${slug}/articles`} label="Back to Articles" />
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>Create Article</Typography>
      <ArticleEditorForm editor={editor} contentPlaceholder="Write your article content here..." />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" startIcon={<SaveOutlined />} size="large">Create Article</Button>
        <Button variant="outlined" component={Link} href={`/site/${slug}/articles`}>Cancel</Button>
      </Box>
    </Container>
  )
}
