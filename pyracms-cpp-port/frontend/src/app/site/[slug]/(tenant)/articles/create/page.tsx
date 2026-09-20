'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button, Alert } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useTenantId } from '@/hooks/useTenantId'
import { usePermissions } from '@/hooks/usePermissions'
import { DetailedErrorAlert } from '@/components/common/DetailedErrorAlert'
import { BackButton } from '@/components/common/BackButton'
import { ArticleEditorForm } from '@/components/articles/ArticleEditorForm'
import { useCreateArticle } from './useCreateArticle'

export default function CreateArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { editor, saving, error, errorDetails, create } = useCreateArticle(
    slug,
    tenantId,
  )
  const back = `/site/${slug}/articles`
  const { can, signedIn } = usePermissions(slug)

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="create-article-page">
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={back}
          label="Back to Articles"
          data-testid="back-to-articles-btn"
        />
      </Box>
      {!can('writeArticles') && (
        <Alert severity="info" data-testid="create-article-denied">
          {signedIn
            ? 'Writing articles needs Moderator level on this site.'
            : 'Sign in as a Moderator or Administrator to write articles.'}
        </Alert>
      )}
      <section aria-label="Create article form">
        <Typography variant="h3" component="h1" gutterBottom>
          Create Article
        </Typography>
        <DetailedErrorAlert
          message={error}
          details={errorDetails}
          testId="create-article-error"
        />
        <ArticleEditorForm
          editor={editor}
          draftKey={`new:${slug}`}
          contentPlaceholder="Write your article content here..."
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            size="large"
            onClick={create}
            disabled={saving || !editor.title.trim()}
            data-testid="create-article-submit"
          >
            {saving ? 'Creating...' : 'Create Article'}
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href={back}
            data-testid="cancel-create-btn"
          >
            Cancel
          </Button>
        </Box>
      </section>
    </Container>
  )
}
