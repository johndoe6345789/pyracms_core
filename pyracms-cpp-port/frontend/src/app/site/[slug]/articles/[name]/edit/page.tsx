'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import { BackButton } from '@/components/common/BackButton'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'

const PLACEHOLDER = {
  title: 'Getting Started with Next.js',
  content: '<h2>Introduction</h2>\n<p>Next.js is a powerful React framework that enables server-side rendering, static site generation, and more.</p>\n\n<h2>Setting Up Your Project</h2>\n<p>To get started, you can create a new Next.js project using the create-next-app CLI tool.</p>',
  renderer: 'HTML',
  tags: ['nextjs', 'react', 'tutorial', 'webdev'],
}

export default function EditArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const editor = useArticleEditor(PLACEHOLDER)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <BackButton href={`/site/${slug}/articles/${name}`} label="Back to Article" />
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>Edit Article</Typography>
      <ArticleEditorForm editor={editor} />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" startIcon={<SaveOutlined />} size="large">Save Changes</Button>
        <Button variant="outlined" component={Link} href={`/site/${slug}/articles/${name}`}>Cancel</Button>
      </Box>
    </Container>
  )
}
