'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Container, Typography, Box, Button, Alert } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import { SnippetFilters } from '@/components/code/SnippetFilters'
import { SnippetGrid } from '@/components/code/SnippetGrid'
import { BackButton } from '@/components/common/BackButton'
import { useSnippets } from '@/hooks/useSnippets'
import { useTenantId } from '@/hooks/useTenantId'

export default function SnippetsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const s = useSnippets(tenantId)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="snippets-page">
      <Box sx={{ mb: 2 }}>
        <BackButton href={`/site/${slug}`} label="Back to Site" />
      </Box>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2,
      }}>
        <Typography variant="h3" component="h1">
          Code Snippets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          component={Link}
          href={`/site/${slug}/snippets/new`}
          data-testid="new-snippet-btn"
          aria-label="Create new snippet"
        >
          New Snippet
        </Button>
      </Box>
      <SnippetFilters s={s} />
      {s.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Could not load snippets. Please try again later.
        </Alert>
      )}
      <SnippetGrid s={s} slug={slug} />
    </Container>
  )
}
